import type { Record, Map, List, Set } from "immutable";
import type { Readable } from "svelte/store";

export type Crossword = {
    grid: Grid;
    size: number;
    clues: ClueMap;
    title?: string;
    theme?: string;
}

export type ClueMap = Map<Set<number>, Clue>;

export type Grid = List<Square>;

export type Clue = Record<{
    orientation: Orientation;
    number: number;
    text: string;
    indices: Set<number>;
    associations: List<Set<number>>;
}>

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

export type EditableCrossword = Readable<Crossword> & {
    load: (crossword: Crossword) => void;
    execute: (command: EditorCommand) => CommandExecutionResultType;
    undo: () => CommandExecutionResultType;
    redo: () => CommandExecutionResultType;
    history: () => Readonly<EditorHistory>
}

export type PlayableCrossword = EditableCrossword & {
    key: string;
}

export type EditorHistory = {
    undo: List<EditorCommand>,
    redo: List<EditorCommand>
}

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
    NoHistory,
    Success
}

export enum EditorCommandType {
    ResizeGrid,
    ToggleSquare,
    UpdateValue,
    UpdateClue,
    SetAssociation
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

