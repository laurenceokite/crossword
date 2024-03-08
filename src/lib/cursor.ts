import type { Crossword, Square, WhiteSquare } from "./crossword";
import { Orientation } from "./types";

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

export function get2DIndices(index: number, size: number): [x: number, y: number] {
    return [
        index % size,
        Math.floor(index / size)
    ]
} 

export function moveCursor(
    direction: Direction, 
    crossword: Crossword, 
    cursor: CursorState, 
    xIndex: number, 
    yIndex: number
): CursorState {
    const targetOrientation = direction === Direction.Up || direction === Direction.Down 
        ? Orientation.Down
        : Orientation.Across;

    if (
        cursor.orientation !== targetOrientation
    ) {
        return {
            ...cursor,
            orientation: targetOrientation
        }
    }

    if (
        isAtMovementBound(direction, crossword.size, xIndex, yIndex)
    ) {
        return cursor;
    }

    return move(direction, cursor, crossword.size);
}

function move(direction: Direction, cursor: CursorState, size: number): CursorState {
    let increment = 0;
    const { index } = cursor;
    const ciel = (size ** 2) - 1; 

    switch (direction) {
        case Direction.Left:
            increment = -1;
            break;
        case Direction.Up:
            increment = -(size);
            break;
        case Direction.Down:
            increment = size;
            break;
        case Direction.Right:
            increment = 1;
    }

    if ((increment + index) < 0 || (increment + index) > ciel) {
        return cursor;
    }

    return {
        ...cursor,
        index: increment + index
    }
} 

export function isAtMovementBound(direction: Direction, size: number, x: number, y: number): boolean {
    switch (direction) {
        case Direction.Left:
            return x <= 0;
        case Direction.Up:
            return y <= 0;
        case Direction.Right:
            return x >= size - 1
        case Direction.Down:
            return y >= size - 1;
    } 
}