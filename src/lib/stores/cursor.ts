import { Direction, Orientation, type Clue, type ClueAssociationKey, type Crossword, type CursorState, type EditableCrossword, type WhiteSquare } from "../types";
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
        let index: number | null = null;
        const { grid } = crossword;
        const number = grid[cursor.index][cursor.orientation];

        const findEmpty = (clues: [string, Clue][]): number | null => {
            for (let i = 0; i < clues.length; i++) {
                if (clues[i][1].squares.length) {
                    const { squares } = clues[i][1];
                    for (let j = 0; j < squares.length; j++) {
                        if (grid[squares[j]].value?.trim() === "") {
                            return squares[j];
                        }
                    }
                }
            }

            return null;
        }

        const clues = (orientation: Orientation) => Object.entries(crossword[orientation]);

        if (number) {
            const word = crossword[cursor.orientation][number]?.squares;
            let restWord: number[] | null = null;

            if (word && word.length) {
                restWord = word.filter(i => i > cursor.index);
            }

            if (restWord && restWord.length) {
                for (let i = 0; i < restWord.length; i++) {
                    if (grid[restWord[i]].value?.trim() === "") {
                        return {
                            ...cursor,
                            index: restWord[i]
                        }
                    }
                }
            }

            const restClues = Object.entries(crossword[cursor.orientation]).filter(([n]) => parseInt(n) > number);
            index = findEmpty(restClues);

            if (index !== null) {
                return {
                    ...cursor,
                    index
                }
            }

            index = findEmpty(clues(getOppositeOrientation(cursor.orientation)));

            if (index !== null) {
                return {
                    ...cursor,
                    index
                }
            }
        }

        index = findEmpty(clues(cursor.orientation));

        if (index !== null) {
            return {
                ...cursor,
                index
            }
        }

        index = findEmpty(clues(getOppositeOrientation(cursor.orientation)));

        if (index !== null) {
            return {
                ...cursor,
                index
            }
        }

        return cursor;
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
    toggleOrientation,
    goToNextEmptySquare
}
