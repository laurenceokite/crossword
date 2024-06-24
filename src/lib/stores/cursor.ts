import type { List } from "immutable";
import { iterateListBy, iterateListFrom } from "../grid";
import { Direction, Orientation, type Clue, type Crossword, type CursorState, type Square, type WhiteSquare } from "../types";
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

        // update orientation if not already going in direction.
        if (cursor.orientation !== targetOrientation && skipBlack) {
            return {
                ...cursor,
                orientation: targetOrientation
            };
        }

        // stop at the outer bounds.
        if (
            isAtMovementBound(size, direction, cursor.index)
        ) {
            return cursor;
        }

        // get the new index.
        const increment = getIncrement(size, direction);
        let index = cursor.index + increment;

        // if index is not in array do nothing.
        // also slightly confusing but List has it's own length property called size..
        if (index < 0 || index > crossword.grid.size - 1) {
            return cursor;
        }

        // if skip black, do the thing.
        if (skipBlack && crossword.grid.get(index)?.isBlack) {
            const iterator = isAcross(cursor.orientation)
                ? iterateListFrom(crossword.grid, index)
                : iterateListBy(crossword.grid, size, index);

            for (const square of iterator) {
                if (square && !square.isBlack) {
                    return {
                        ...cursor,
                        index: square.index
                    };
                }
            }
        }

        // otherwise we can just send back the incremented index.
        return {
            ...cursor,
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

function goToNextEmptySquare(crossword: Crossword, number?: number) {
    cursorStore.update(cursor => {
        const { size } = crossword;
        const { orientation } = cursor;
        const isEmptySquare = (square: Square): boolean => !square.isBlack && square.value.trim() === "";
        const _isAcross = isAcross(cursor.orientation);

        // if we are in a word we need to look through the word first
        if (number) {
            const clue = crossword.clues.find(clue => clue.get('orientation') === orientation && clue.get('number') === number);

            if (clue) {
                const squares = clue.get('indices').toSeq()
                    .map(i => crossword.grid.get(i))
                    .filter(s => s && !s.isBlack)
                    .toList() as List<WhiteSquare>;

                const index = squares.findIndex(s => s.index === cursor.index);
                const wordIter = _isAcross
                    ? iterateListFrom(squares, index)
                    : iterateListBy(squares, size, index);

                for (const square of wordIter) {
                    if (square && isEmptySquare(square)) {
                        return {
                            ...cursor,
                            index: square.index
                        }
                    }
                }
            }
        }

        const gridIter = _isAcross
            ? iterateListFrom(crossword.grid, cursor.index + 1)
            : iterateListBy(crossword.grid, size, cursor.index + size);

        for (const square of gridIter) {
            if (square && isEmptySquare(square)) {
                return {
                    ...cursor,
                    index: (square as WhiteSquare).index
                }
            }
        }

        return cursor;
    });
}

export function getOppositeOrientation(orientation: Orientation) {
    return orientation === Orientation.Across ? Orientation.Down : Orientation.Across;
}

export function isAcross(o: Orientation) {
    return o === Orientation.Across;
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

function getIterator(grid: Grid, orientation: Orientation, size) {
    const iterator = isAcross(orientation)
        ? iterateListFrom(crossword.grid, index)
        : iterateListBy(crossword.grid, size, index);
}

export default {
    subscribe: cursorStore.subscribe,
    move,
    setIndex,
    toggleOrientation,
    goToNextEmptySquare
}
