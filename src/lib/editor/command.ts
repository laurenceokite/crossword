import type { Crossword } from "../crossword";

export interface EditorCommand {
    readonly type: EditorCommandType;
    readonly displayName: string;
    readonly renumber: boolean;
    execute(crossword: Crossword): CommandExecutionResult;
    undo(crossword: Crossword): Crossword;
}

export type CommandExecutionResult = CommandExecutionSuccess | CommandExecutionNoOperation;

export interface CommandExecutionSuccess {
    type: CommandExecutionResultType.Success;
    crossword: Crossword;
}

export interface CommandExecutionNoOperation {
    type: CommandExecutionResultType.NoOperation;
    crossword: Crossword;
}

export enum CommandExecutionResultType {
    NoOperation,
    Success
}

export enum EditorCommandType {
    ResizeGrid,
    ToggleSquare,
    UpdateValue,
};
