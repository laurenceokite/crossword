import type { Orientation } from "./cursor";

export type Crossword = {
    grid: Grid;
    metadata: CrosswordMetadata;
    clues: ClueSet;
}

export type Grid = Square[];

export type CrosswordMetadata = {
    size: number;
    title?: string;
    theme?: string;
}

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
}






