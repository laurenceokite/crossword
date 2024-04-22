import type { Crossword, WhiteSquare } from "../crossword";
import { Orientation, type CursorState, Direction } from "../cursor";
import { writable } from "svelte/store";
import type { EditableCrossword } from "../editor/types";
import type { AnswerMap } from "./types";

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
        const { size } = crossword.metadata;

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
        const orientation = getOppositeOrientation(cursor);
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

function goToNextEmptySquare(crossword: EditableCrossword) {
    cursorStore.update(cursor => {
        let index = cursor.index;
        const { grid } = crossword;
        const square = grid[index];

        if (square.isBlack) {
            return cursor;
        }

        const number = square[cursor.orientation];
        const increment = cursor.orientation === Orientation.Down ? crossword.metadata.size : 1;

        index += increment;
        while (grid[index] && !grid[index].isBlack && (grid[index] as WhiteSquare)[cursor.orientation] === number) {
            if (!(grid[index] as WhiteSquare).value) {
                return {
                    ...cursor,
                    index
                }
            }
            index += increment;
        }

        const word = crossword.answerMap[cursor.orientation].get(number);
        const start = word ? word[0] : null;

        if (start !== null && start !== cursor.index) {
            index = start;

            while (grid[index] && !grid[index].isBlack && index < cursor.index) {
                if (!(grid[index] as WhiteSquare)) {
                    return {
                        ...cursor,
                        index
                    }
                }
                index += increment;
            }
        }

        if (cursor.orientation === Orientation.Across) {
            for (index; index < grid.length; index++) {
                if (grid[index] && !grid[index].isBlack && !(grid[index] as WhiteSquare).value) {
                    return {
                        ...cursor,
                        index
                    }
                }
            }

            for (index = 0; index < cursor.index; index++) {
                if (grid[index] && !grid[index].isBlack && !(grid[index] as WhiteSquare).value) {
                    return {
                        ...cursor,
                        index
                    }
                }
            }

            return cursor;
        }

        let answerIter = crossword.answerMap.down.entries();

        while (answerIter.next().value[0] !== number);

        let answer: [number, number[]] | undefined = answerIter.next().value;

        while (answer) {
            answer[1].forEach(i => {
                if (grid[i] && !grid[i].isBlack && !(grid[i] as WhiteSquare).value) {
                    return {
                        ...cursor,
                        index: i
                    }
                }
            })
            answer = answerIter.next().value;
        }

        for (index = 0; index < cursor.index; index++) {
            if (grid[index] && !grid[index].isBlack && !(grid[index] as WhiteSquare).value) {
                return {
                    ...cursor,
                    index
                }
            }
        }

        return cursor;
    });
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
    toggleOrientation,
    goToNextEmptySquare
}
