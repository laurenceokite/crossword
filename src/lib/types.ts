export type Crossword = {
    grid: Grid;
    size: number;
    clues: ClueSet;
    title?: string;
    theme?: string;
}

export type Grid = Square[];

export type Clue = {
    text: string;
    associations: ClueAssociationKey[];
}

export type ClueAssociationKey = [Orientation, number]

export type ClueSet = {
    across: Map<number, Clue>;
    down: Map<number, Clue>;
}

export enum SquareDecoration { }

export type Square = WhiteSquare | BlackSquare;

export type WhiteSquare = {
    readonly isBlack: false;
    index: number;
    value: string;
    across: number;
    down: number;
    number: number | null;
    decoration: SquareDecoration | null;
    rebus: boolean;
}

export type BlackSquare = {
    readonly isBlack: true;
    index: number;
    value: null;
    across: null;
    down: null;
    number: null;
    decoration: null;
    rebus: false;
}

export type EditableCrossword = Crossword & {
    history: { undo: EditorCommand[], redo: EditorCommand[] };
    answerMap: AnswerMap;
}

export interface AnswerMap {
    across: Map<number, number[]>;
    down: Map<number, number[]>;
};

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
    Across = "across",
    Down = "down"
}

export interface CursorState {
    orientation: Orientation;
    index: number;
}

