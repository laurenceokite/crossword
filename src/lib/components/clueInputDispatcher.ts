import { createEventDispatcher } from "svelte";
import type { Orientation } from "../types";

export type ClueInputEvents = {
    updateClue: [Orientation, number, string];
    updateValue: [number, string];
    clearValue: number;
}

export type ClueInputEvent<T extends keyof ClueInputEvents> = CustomEvent<ClueInputEvents[T]>;

export function createClueInputDispatcher<T extends Record<string, any> = {}>() {
    return createEventDispatcher<ClueInputEvents & T>();
}
