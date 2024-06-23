import { Collection, isCollection } from "immutable";
import type { Subscriber, Writable } from "svelte/store";

const queue: FuncArgTuple<Subscriber<any>>[] = []

export type FuncArgTuple<T extends (...args: any) => any> = [T, ...Parameters<T>];

export function safeNotEqual(a: any, b: any) {
    return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

export function writable<T>(value: T): Writable<T> {
    const subscribers = new Set<(value: T) => void>();

    function subscribe(subscriber: Subscriber<T>) {
        subscribers.add(subscriber);
        subscriber(value);
        return () => subscribers.delete(subscriber);
    }

    function set(newValue: T) {
        if (isCollection(value) ? !(<Collection<any, any>>newValue).equals(value) : safeNotEqual(value, newValue)) {
            value = newValue;
            if (!subscribers.entries.length) {
                const runQueue = !queue.length;
                subscribers.forEach(subscriber => { queue.push([subscriber, value]) });

                if (runQueue) {
                    for (let i = 0; i < queue.length; i++) {
                        queue[i][0](queue[i][1]);
                    }
                }

                queue.length = 0;
            }
        }
    }

    return { subscribe, set, update: (fn: (v: T) => T) => { set(fn(value)) } }
}


