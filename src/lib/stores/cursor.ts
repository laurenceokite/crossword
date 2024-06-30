import { Direction, Orientation, type Crossword, type CursorState, type Square } from "../types";
import { Iter } from "../iterators";
import { writable } from "svelte/store";

const cursorStore = writable<CursorState>({
    index: 0,
    orientation: Orientation.Across,
    number: null,
    previousNumber: null
});

function initialize(crossword: Crossword) {
    setIndex(crossword, 0);
}

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
        if (index < 0 || index > crossword.grid.length - 1) {
            return cursor;
        }

        // if skip black, do the thing.
        if (skipBlack && crossword.grid[index]?.isBlack) {
            const iterator = getGridIterator(new Iter(crossword.grid[Symbol.iterator]()), cursor.orientation, index);
            for (const square of iterator) {
                if (square && !square.isBlack) {
                    return {
                        ...cursor,
                        index: square.index,
                        number: square[cursor.orientation],
                        previousNumber: cursor.number
                    };
                }
            }
        }

        // otherwise we can just send back the incremented index.
        const square = crossword.grid[index];

        return {
            ...cursor,
            index,
            number: square && !square.isBlack ? square[cursor.orientation] : null,
            previousNumber: cursor.number
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

function setIndex(crossword: Crossword, index: number) {
    if (index < 0 || index >= (crossword.grid.length)) {
        return;
    }

    cursorStore.update(cursor => {
        const square = crossword.grid[index];

        return {
            ...cursor,
            index,
            number: square && !square.isBlack ? square[cursor.orientation] : null,

        }
    });
}

function goToNextEmptySquare(crossword: Crossword, indices?: ReadonlySet<number>) {
    cursorStore.update(cursor => {
        const isEmptySquare = (square: Square): boolean => !square.isBlack && square.value.trim() === "";

        if (indices) {
            const squares = new Iter(crossword.grid[Symbol.iterator]())
                .denseMap((square, index) => indices.has(index) ? square : undefined)
                .toArray();
            const index = squares.findIndex(s => s.index === cursor.index);
            const wordIter = getGridIterator(new Iter(squares[Symbol.iterator]()), cursor.orientation, index)

            for (const square of wordIter) {
                if (square && isEmptySquare(square)) {
                    return {
                        ...cursor,
                        index: square.index
                    }

                }
            }
        }

        const increment = isAcross(cursor.orientation) ? 1 : crossword.size;
        const gridIter = getGridIterator(new Iter(crossword.grid[Symbol.iterator]()), cursor.orientation, cursor.index + increment);

        for (const square of gridIter) {
            if (square && isEmptySquare(square)) {
                return {
                    ...cursor,
                    index: square.index
                }
            }
        }

        return cursor;
    });
}

function getGridIterator(iterator: Iter<Square>, orientation: Orientation, from: number) {
    return isAcross(orientation)
        ? iterator.iterateFrom(from)
        : iterator
            .iterateFrom(from)
            .iterateBySqrt();
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

export const cursor = {
    subscribe: cursorStore.subscribe,
    move,
    setIndex,
    toggleOrientation,
    goToNextEmptySquare,
    initialize
}
