import { derived, type Readable } from "svelte/store";
import type { Crossword, WhiteSquare } from "../crossword";
import type { CrosswordCompletion, AnswerStore } from "./types";
import { Orientation } from "../cursor";

export function createAnswerStore(crosswordStore: Readable<Crossword>): AnswerStore {
    return derived(crosswordStore, $crossword => {
        const { grid } = $crossword;
        const across = new Map<number, WhiteSquare[]>();
        const down = new Map<number, WhiteSquare[]>();

        for (let i = 0; i < grid.length; i++) {
            const square = grid[i];
            if (square.isBlack) {
                continue;
            }

            if (across.has(square.across)) {
                across.get(square.across)?.push(square);
            } else {
                across.set(square.across, [square]);
            }

            if (down.has(square.down)) {
                down.get(square.down)?.push(square);
            } else {
                down.set(square.down, [square]);
            }
        }

        const completion = {
            across: new Map<number, boolean>(),
            down: new Map<number, boolean>(),
            isComplete: true
        };

        across.forEach((squares, number) => {
            setCompletionEntry(completion, Orientation.Across, number, squares);
        });

        down.forEach((squares, number) => {
            setCompletionEntry(completion, Orientation.Down, number, squares);
        });

        return {
            across,
            down,
            completion
        }
    })
};

function setCompletionEntry(completion: CrosswordCompletion, orientation: Orientation, number: number, squares: WhiteSquare[]) {
    const isComplete = squares.every(s => s.value);

    if (completion.isComplete && !isComplete) {
        completion.isComplete = false;
    }

    completion[orientation].set(number, isComplete);
}
