export class Iter<T> implements IterableIterator<T> {
    constructor(private iterable: IterableIterator<T>) { }
    [Symbol.iterator]() {
        return this;
    }
    next(...args: [] | [undefined]) {
        return this.iterable.next(...args);
    }
    map<R>(fn: (value: T, index: number) => R): Iter<R> {
        return new Iter(map(this.iterable, fn));
    }
    denseMap<R>(fn: (value: T, index: number) => R): Iter<NonNullable<R>> {
        return new Iter(denseMap(this.iterable, fn));
    }
    filter(predicate: (value: T, index: number) => boolean) {
        return new Iter(filter(this.iterable, predicate));
    }
    reduce<R>(
        reducer: (accumulator: R, currentValue: T) => R,
        initialValue: R
    ) {
        return reduce(this.iterable, reducer, initialValue);
    }
    partition(predicate: (value: T, index: number) => boolean): [Iter<T>, Iter<T>] {
        const result = partition(this.iterable, predicate);
        return [new Iter(result[0]), new Iter(result[1])];
    }
    iterateBySqrt() {
        return new Iter(iterateBySqrt(this.iterable))
    }
    iterateFrom(index: number) {
        return new Iter(iterateFrom(this.iterable, index))
    }
    concat(...iterators: IterableIterator<T>[]) {
        return new Iter(concat(this.iterable, ...iterators))
    }
    toArray(): T[] {
        return [...this.iterable];
    }
}

export function* map<R, T>(iterator: IterableIterator<T>, fn: (value: T, index: number) => R): IterableIterator<R> {
    let index = 0;
    for (let result = iterator.next(); !result.done; result = iterator.next()) {
        yield fn(result.value, index);
        index++;
    }
}

export function* denseMap<R, T>(iterator: IterableIterator<T>, fn: (value: T, index: number) => R): IterableIterator<NonNullable<R>> {
    let index = 0;
    for (let result = iterator.next(); !result.done; result = iterator.next()) {
        const value = fn(result.value, index);
        if (value !== null && value !== undefined) {
            yield value;
        }
        index++;
    }
}

export function* filter<T>(iterator: IterableIterator<T>, predicate: (value: T, index: number) => boolean) {
    let index = 0;
    for (let result = iterator.next(); !result.done; result = iterator.next()) {
        if (predicate(result.value, index)) {
            yield result.value;
        }
        index++;
    }
}

export function reduce<T, R>(
    iterable: IterableIterator<T>,
    reducer: (accumulator: R, currentValue: T) => R,
    initialValue: R
): R {
    let accumulator = initialValue;

    for (const item of iterable) {
        accumulator = reducer(accumulator, item);
    }

    return accumulator;
}

export function partition<T>(iterator: IterableIterator<T>, predicate: (value: T, index: number) => boolean): [IterableIterator<T>, IterableIterator<T>] {
    let index = 0;
    function* filtered(predicateValue: boolean): IterableIterator<T> {
        for (const item of iterator) {
            if (predicate(item, index) === predicateValue) {
                yield item;
            }
            index++
        }
    }

    return [filtered(false), filtered(true)];
}

export function* iterateBySqrt<T>(iterable: IterableIterator<T>): IterableIterator<T> {
    const array = [...iterable];
    const length = array.length;
    const interval = Math.floor(Math.sqrt(length));

    let index = 0;
    let count = 0;
    while (count < length) {
        yield array[Math.floor(index % length)];
        index += interval;
        count++;
    }
}

export function* iterateFrom<T>(iterator: IterableIterator<T>, start: number): IterableIterator<T> {
    concat(...partition(iterator, (_, index) => index >= start));
}

export function* concat<T>(...iterators: IterableIterator<T>[]): IterableIterator<T> {
    for (const iterator of iterators) {
        yield* iterator;
    }
}

