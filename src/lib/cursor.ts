import type { Orientation } from "./types";

export enum Direction {
    Left, 
    Up,
    Down,
    Right    
}

export interface CursorState {
    orientation: Orientation,
    index: number
}
