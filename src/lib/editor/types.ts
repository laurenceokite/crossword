import type { Crossword } from "$lib/crossword";

export enum Orientation {
    Across,
    Down
}

export enum EditMode {
    Insert,
    Grid
}

export enum Direction {
    Left, 
    Up,
    Down,
    Right    
}

export interface CursorState {
    orientation: Orientation,
    index: number,
    x: number,
    y: number
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

export enum CommandExecutionResultType{
    NoOperation,
    Success
}

export enum EditorCommandType {
    ResizeGrid,
    ToggleSquare,
    UpdateValue,
};