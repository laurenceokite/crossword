import { Direction, Orientation, type Clue, type Crossword, type CursorState, type EditableCrossword, type Square, type WhiteSquare } from "../types";
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
        const { size } = crossword;

        if (cursor.orientation !== targetOrientation && skipBlack) {
            return {
                ...cursor,
                orientation: targetOrientation
            };
        }

        if (
            isAtMovementBound(size, direction, cursor.index)
        ) {
            return cursor;
        }

        const increment = getIncrement(size, direction);
        const ciel = (size ** 2) - 1;
        let index = cursor.index + increment;

        if (index < 0 || index > ciel) {
            return {
                ...cursor,
                orientation: targetOrientation
            };
        }

        if (skipBlack && crossword.grid[index].isBlack) {
            let position = cursor.orientation === Orientation.Across
                ? getXIndex(size, index)
                : getYIndex(size, index);

            for (position; position < size; position++) {
                index += increment;

                if (crossword.grid[index] && !crossword.grid[index].isBlack) {
                    return {
                        orientation: targetOrientation,
                        index
                    }
                }
            }

            return {
                ...cursor,
                orientation: targetOrientation
            };
        }

        return {
            orientation: targetOrientation,
            index
        };
    });

}

function toggleOrientation() {
    cursorStore.update(cursor => {
        const orientation = getOppositeOrientation(cursor.orientation);
        return {
            ...cursor,
            orientation
        }
    });
}

function setIndex(crosswordSize: number, index: number) {
    if (index < 0 || index >= (crosswordSize ** 2)) {
        return;
    }

    cursorStore.update(cursor => {
        return {
            ...cursor,
            index
        }
    });
}

export function getIncrement(size: number, direction: Direction): number {
    let increment = 0;

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

    return increment;
}

function goToNextEmptySquare(crossword: Crossword) {
    cursorStore.update(cursor => {
        const { clues, size } = crossword;
        const currentSquare = crossword.grid[cursor.index];
        const emptySquare = (square: Square): boolean => !square.isBlack && square.value.trim() === "";
        const rotate = (array: any[], i: number) => array.slice(i + 1).concat(array.slice(0, i - 1));

        if (!currentSquare.isBlack) {
            const clue = clues.find(clue => clue.orientation === cursor.orientation && clue.number === currentSquare[cursor.orientation]);

            if (clue) {
                const squares = clue.indices.map(i => crossword.grid[i]).filter(s => s && !s.isBlack) as WhiteSquare[];
                const sliceIndex = clue.indices.findIndex(i => i === cursor.index);

                if (sliceIndex === 0) {
                    const square = squares.find(emptySquare);

                    if (square) {
                        return {
                            ...cursor,
                            index: square.index
                        }
                    }
                }

                if (sliceIndex > 0) {
                    const rotatedSquares = rotate(squares, sliceIndex);
                    const square = rotatedSquares.find(s => s.value.trim() === "");

                    if (square) {
                        return {
                            ...cursor,
                            index: square.index
                        }
                    }
                }
            }
        }

        const gridByOrientation

        const grid = rotate(
            ,
        0
        );


});
}

export function getOppositeOrientation(orientation: Orientation) {
    return orientation === Orientation.Across ? Orientation.Down : Orientation.Across;
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

export const getXIndex = (size: number, index: number): number => index % size;
export const getYIndex = (size: number, index: number): number => Math.floor(index / size);
export function getDownByIndex(size: number, index: number): number {
    const x = getXIndex(size, index);
    const y = getYIndex(size, index);

    return y < size - 1 ? y * size + x : x;
}

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
    toggleOrientation,
    goToNextEmptySquare
}
