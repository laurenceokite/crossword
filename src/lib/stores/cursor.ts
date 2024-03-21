import type { Crossword } from "$lib/crossword";
import { Orientation, type CursorState, Direction } from "$lib/cursor";
import { writable } from "svelte/store";

const cursorStore = writable<CursorState>({
    index: 0,
    orientation: Orientation.Across
});

function move(
    crossword: Crossword,
    direction: Direction
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
            isAtMovementBound(crossword, direction, cursor.index)
        ) {
            return cursor;
        }

        const increment = getIncrement(crossword, direction);
        const ciel = (crossword.size ** 2) - 1; 

        if ((increment + cursor.index) < 0 || (increment + cursor.index) > ciel) {
            return cursor;
        }

        return {
            ...cursor,
            index: cursor.index + increment
        };
    });
}

function nextEmptySquare(crossword: Crossword) {
    cursorStore.update(cursor => {
        let i = cursor.index + getIncrement(crossword, forward(cursor.orientation));

        for (let j = 1; j < crossword.grid.length; j++) {
            const square = crossword.grid[i];

            if (square.isBlack || !!square.value) {
                continue;
            }

            return {
                ...cursor,
                index: i
            }
        };

        return cursor;
    }); 
}

function getIncrement(crossword: Crossword, direction: Direction): number {
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

function forward(orientation: Orientation): Direction {
    return orientation === Orientation.Across ? Direction.Right : Direction.Down;
} 

function backward(orientation: Orientation): Direction {
    return orientation === Orientation.Across ? Direction.Left : Direction.Up;
} 

function get2DIndices(crossword: Crossword, index: number): [x: number, y: number] {
    return [
        index % crossword.size,
        Math.floor(index / crossword.size)
    ]
} 

function isAtMovementBound(crossword: Crossword, direction: Direction, index: number): boolean {
    const [x, y] = get2DIndices(crossword, index);

    switch (direction) {
        case Direction.Left:
            return x <= 0;
        case Direction.Up:
            return y <= 0;
        case Direction.Right:
            return x >= crossword.size - 1
        case Direction.Down:
            return y >= crossword.size - 1;
    } 
}

export default {
    subscribe: cursorStore.subscribe,
    move,
    nextEmptySquare
}
