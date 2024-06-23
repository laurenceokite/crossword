import type { Record, Map, List, Set } from "immutable";
import type { Readable } from "svelte/store";

export type Crossword = {
    grid: Grid;
    clues: ClueMap;
    size: number;
    title?: string;
    theme?: string;
}

export type ClueMap = Map<Set<number>, Record<Clue>>;

export type Grid = List<Square>;

export type Clue = {
    orientation: Orientation;
    number: number;
    text: string;
    indices: Set<number>;
    associations: List<Set<number>>;
}

export enum SquareDecoration { }

export type Square = WhiteSquare | BlackSquare;

export type WhiteSquare = {
    readonly isBlack: false;
    value: string;
    [Orientation.Across]: number;
    [Orientation.Down]: number;
    number: number | null;
    decoration: SquareDecoration | null;
    rebus: boolean;
}

export type BlackSquare = {
    readonly isBlack: true;
}

export interface EditableCrossword {
    grid: Readable<Grid>;
    clues: Readable<ClueMap>;
    size: Readable<number>;
    title: () => string | undefined;
    theme: () => string | undefined;

    load: (crossword: Crossword) => void;
    execute: (command: EditorCommand) => void;
    undo: () => void;
    redo: () => void;
    history: () => EditorHistory;
}

export interface PlayableCrossword extends EditableCrossword {
    progress: () => number;
    isComplete: () => boolean;
}

export type EditorHistory = {
    undo: EditorCommand[],
    redo: EditorCommand[]
}

export interface EditorCommand {
    displayName: () => string;
    execute: (crossword: Crossword) => CommandExecutionResult;
}

export type CommandExecutionResult = CommandExecutionSuccess | CommandExecutionVoid;

export type CommandExecutionSuccess = {
    type: CommandExecutionResultType.Success;
    crossword: Crossword;
    undo: EditorCommand;
}

export type CommandExecutionVoid = {
    type: CommandExecutionResultType.Void;
    crossword: Crossword;
}

export enum CommandExecutionResultType {
    Void,
    Success
}

export enum EditMode {
    Insert,
    Grid
}

export enum Direction {
    Left,
    Up,
    Down,
    Right,
}

export enum Orientation {
    Across,
    Down
}

export interface CursorState {
    orientation: Orientation;
    index: number;
}

