import type { Crossword } from "$lib/crossword";
import { derived, type Readable, type Writable } from "svelte/store";

export function createCursorStore(crosswordStore: Readable<Crossword>) {
    const { } = derived(crosswordStore, $crossword => ({ size: $crossword.size, grid: $crossword.grid }));
} 
