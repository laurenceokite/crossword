import type { Crossword } from "../crossword";
import type { AnswerMap } from "../stores/types";
import type { EditorCommand } from "./command";

export interface EditableCrossword extends Crossword {
    history: { undo: EditorCommand[], redo: EditorCommand[] };
    answerMap: AnswerMap;
}

export enum EditMode {
    Insert,
    Grid
}

