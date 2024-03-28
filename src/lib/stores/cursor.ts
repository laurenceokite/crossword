import type { Crossword, WhiteSquare } from "../crossword";
import { Orientation, type CursorState, Direction } from "../cursor";
import { writable } from "svelte/store";
import type { CrosswordAnswers } from "./types";

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
        let { orientation } = cursor;

        const targetOrientation = direction === Direction.Up || direction === Direction.Down
            ? Orientation.Down
            : Orientation.Across;

        if (orientation !== targetOrientation) {
            orientation = targetOrientation;

            if (skipBlack) {
                return {
                    ...cursor,
                    orientation: targetOrientation
                };
            }
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
            return {
                ...cursor,
                orientation
            };
        }

        if (skipBlack && crossword.grid[index].isBlack) {
            let position = cursor.orientation === Orientation.Across
                ? getXIndex(crossword.size, index)
                : getYIndex(crossword.size, index);

            for (position; position < crossword.size; position++) {
                index += increment;

                if (crossword.grid[index] && !crossword.grid[index].isBlack) {
                    return {
                        orientation,
                        index
                    }
                }
            }

            return {
                ...cursor,
                orientation
            };
        }

        return {
            orientation,
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

function goToNextEmptySquare(answers: CrosswordAnswers, currentNumber: number) {
    cursorStore.update(cursor => {
        if (answers.completion.isComplete) {
            return cursor;
        }

        if (
            answers.completion[cursor.orientation].has(currentNumber)
            && !answers.completion[cursor.orientation].get(currentNumber)
        ) {

            const answer = answers[cursor.orientation].get(currentNumber)!;
            let currentIndex = answer.findIndex(s => s.index === cursor.index);
            if (currentIndex === -1) {
                const index = answer.find(s => !s.value)?.index ?? cursor.index;

                return {
                    ...cursor,
                    index
                }
            }

            for (let i = 0; i < answer.length - 1; i++) {
                if (currentIndex >= answer.length) {
                    currentIndex = 0;
                }

                if (answer[currentIndex] && !answer[currentIndex].value) {
                    const { index } = answer[currentIndex];
                    return {
                        ...cursor,
                        index
                    }
                }

                currentIndex++;
            }
        }

        const answerIter = answers.completion[cursor.orientation].entries();

        while (answerIter.next().value[0] !== currentNumber);

        function getEmptySquareIndex(answer: WhiteSquare[]) {
            const emptySquare = answer.find(s => !s.value);

            if (emptySquare) {
                return emptySquare.index;
            } else {
                return null;
            }
        }

        for (const [number, isComplete] of answerIter) {
            if (!isComplete && answers[cursor.orientation].has(number)) {
                const index = getEmptySquareIndex(answers[cursor.orientation].get(number)!);

                if (index !== null) {
                    return {
                        ...cursor,
                        index
                    }
                }
            }
        }

        for (const [number, isComplete] of answers.completion[cursor.orientation].entries()) {
            if (number === currentNumber) {
                break;
            }

            if (!isComplete && answers[cursor.orientation].has(number)) {
                const index = getEmptySquareIndex(answers[cursor.orientation].get(number)!);

                if (index !== null) {
                    return {
                        ...cursor,
                        index
                    }
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
