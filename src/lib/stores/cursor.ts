import type { Crossword } from "../crossword";
import { Orientation, type CursorState, Direction } from "../cursor";
import { writable } from "svelte/store";

const cursorStore = writable<CursorState>({
    index: 0,
    orientation: Orientation.Across
});

function move(
    crossword: Crossword,
    direction: Direction,
    skipBlack: boolean = false
) {
    cursorStore.update(cursor => {
        const targetOrientation = direction === Direction.Up || direction === Direction.Down 
            ? Orientation.Down
            : Orientation.Across;

        if (
            cursor.orientation !== targetOrientation
        ) {
            return {
                ...cursor,
                orientation: targetOrientation
            };
        }

        if (
            isAtMovementBound(crossword.size, direction, cursor.index)
        ) {
            return cursor;
        }

        const increment = getIncrement(crossword, direction);
        const ciel = (crossword.size ** 2) - 1; 
        let index = cursor.index + increment;

        if (index < 0 || index > ciel) {
            return cursor;
        }

        if (skipBlack && crossword.grid[index].isBlack) {
            let position = cursor.orientation === Orientation.Across 
                ? getXIndex(crossword.size, index) 
                : getYIndex(crossword.size, index);

            for (position; position < crossword.size; position++) {
                index += increment;

                if (crossword.grid[index] && !crossword.grid[index].isBlack) {
                    return {
                        ...cursor,
                        index
                    }
                }
            }

            return cursor;
        }

        return {
            ...cursor,
            index
        };
    });

}

function toggleOrientation() {
    cursorStore.update(cursor => { 
        const orientation = getOppositeOrientation(cursor);
        return {
            ...cursor,
            orientation
        }
    });
}

function setIndex(crossword: Crossword, index: number) {
    if (index < 0 || index >= crossword.size) {
        return;
    }

    cursorStore.update(cursor => {
        return {
            ...cursor,
            index
        }
    });
} 

export function getIncrement(crossword: Crossword, direction: Direction): number {
    let increment = 0;

    switch (direction) {
        case Direction.Left:
            increment = -1;
            break;
        case Direction.Up:
            increment = -(crossword.size);
            break;
        case Direction.Down:
            increment = crossword.size;
            break;
        case Direction.Right:
            increment = 1;
    }
    
    return increment;
} 

export function getOppositeOrientation(cursor: CursorState) {
    return cursor.orientation === Orientation.Across ? Orientation.Down : Orientation.Across;
}

export function forward(orientation: Orientation): Direction {
    return orientation === Orientation.Across ? Direction.Right : Direction.Down;
} 

export function backward(orientation: Orientation): Direction {
    return orientation === Orientation.Across ? Direction.Left : Direction.Up;
} 

export function get2DIndices(size: number, index: number): [x: number, y: number] {
    return [
        getXIndex(size, index),
        getYIndex(size, index)
    ]
} 

export const getXIndex = (size: number, index: number) => index % size;
export const getYIndex = (size: number, index: number) => Math.floor(index / size);
   

export function isAtMovementBound(size: number, direction: Direction, index: number): boolean {
    const [x, y] = get2DIndices(size, index);

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

export default {
    subscribe: cursorStore.subscribe,
    move,
    setIndex,
    toggleOrientation
}
