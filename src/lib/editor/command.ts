import type { Crossword } from "$lib/crossword";
import type {  CommandExecutionResult, EditorCommandType } from "./types";

export interface EditorCommand {
    readonly type: EditorCommandType;
    readonly displayName: string;
    execute(crossword: Crossword): CommandExecutionResult;
    undo(crossword: Crossword): Crossword;
}