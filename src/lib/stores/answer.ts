import type { Square } from "../crossword";
import type { AnswerMap } from "./types";

export function createAnswerMap(grid: Square[]): AnswerMap {
    const across = new Map<number, number[]>();
    const down = new Map<number, number[]>();

    for (let i = 0; i < grid.length; i++) {
        const square = grid[i];
        if (square.isBlack) {
            continue;
        }

        if (across.has(square.across)) {
            across.get(square.across)?.push(i);
        } else {
            across.set(square.across, [i]);
        }

        if (down.has(square.down)) {
            down.get(square.down)?.push(i);
        } else {
            down.set(square.down, [i]);
        }
    }

    return {
        across,
        down,
    }
};

