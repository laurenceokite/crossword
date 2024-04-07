import type { Crossword } from "../crossword";

export interface EditorCommand {
    displayName: () => string;
    commandType: () => EditorCommandType;
    execute: (crossword: Crossword) => CommandExecutionResult;
}

export type CommandExecutionResult = CommandExecutionSuccess | CommandExecutionNoOperation;

export type CommandExecutionSuccess = {
    type: CommandExecutionResultType.Success;
    crossword: Crossword;
    undo: EditorCommand;
}

export type CommandExecutionNoOperation = {
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
    UpdateValue
}

