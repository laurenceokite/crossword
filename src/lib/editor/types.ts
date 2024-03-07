import type { Crossword } from "$lib/crossword";
import type { EditorCommand } from "./command";

export interface EditableCrossword extends Crossword {
    history: { undo: EditorCommand[], redo: EditorCommand[] };
}

export enum EditMode {
    Insert,
    Grid
}

