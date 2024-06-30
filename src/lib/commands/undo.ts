import { type Crossword, type EditorCommand } from "../types";

export function undo(command: EditorCommand, callback: (c: Crossword) => Crossword): EditorCommand {
    return {
        displayName: () => `Undo ${command.displayName()}.`,
        execute: (c: Crossword) => {
            return {
                crossword: callback(c),
                undo: command
            }
        }
    }
}
