import type { Crossword, } from "./crossword";

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

