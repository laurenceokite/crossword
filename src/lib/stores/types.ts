import type { Readable } from "svelte/store";
import type { Crossword, WhiteSquare } from "../crossword";

export type AnswerMap = Map<number, WhiteSquare[]>;
export interface CrosswordAnswers {
    across: AnswerMap;
    down: AnswerMap;
    completion: CrosswordCompletion;
};

export type AnswerStore = Readable<CrosswordAnswers>;

export type AnswerCompletionMap = Map<number, boolean>;
export interface CrosswordCompletion {
    across: AnswerCompletionMap;
    down: AnswerCompletionMap;
    isComplete: boolean;
};

export interface CrosswordStore extends Readable<Crossword> {
    answerStore: AnswerStore;
};
