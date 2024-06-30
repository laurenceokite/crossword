import { Square, type Crossword, type EditorCommand } from "../types";
import { undo } from "./undo";

export function updateValue(index: number, value: string): EditorCommand {
    function execute(crossword: Crossword) {
        const square = crossword.grid[index];

        if (
            !square
            || square.isBlack
        ) {
            return { crossword }
        }

        const previousState = square;
        const newValues = {
            value: value.toUpperCase(),
            rebus: value.length > 1
        }

        const grid: ReadonlyArray<Square> = crossword.grid.map((sq, i) => i === index ? sq.update(() => newValues) : sq);

        return {
            crossword: {
                ...crossword,
                grid
            },
            undo: undo(
                updateValue(index, value),
                (cw: Crossword) => {
                    return {
                        ...cw,
                        grid: cw.grid.map((sq, i) => i === index ? previousState : sq)
                    }
                }
            )
        }
    }

    return {
        displayName: () => "update value",
        execute
    }
}

