export interface Crossword {
    grid: Square[];
    size: number;
}

export enum SquareDecoration { }

export type Square = WhiteSquare | BlackSquare;

export interface WhiteSquare {
    readonly isBlack: false;
    index: number;
    value: string;
    across: number;
    down: number;
    number: number | null;
    decoration: SquareDecoration | null;
    rebus: boolean;
}

export interface BlackSquare {
    readonly isBlack: true;
}






