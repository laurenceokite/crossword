import type { Readable } from "svelte/store";
import type { Crossword, WhiteSquare } from "../crossword";
import type { Orientation } from "../cursor";

export type WordMap = Map<number, WhiteSquare[]>;
export type CrosswordMap = {
    [K in Orientation]: WordMap;
} & {
    completion: CrosswordCompletionMap;
}

export type WordStore = Readable<CrosswordMap>;

export type WordCompletionMap = Map<number, boolean>;
export type CrosswordCompletionMap = {
    [K in Orientation]: WordCompletionMap;
} & {
    isComplete: boolean;
}

export interface CrosswordStore extends Readable<Crossword> {
    wordStore: WordStore;
};
