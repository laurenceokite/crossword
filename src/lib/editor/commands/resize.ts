import type { Crossword, WhiteSquare, Square } from "$lib/crossword";
import type { EditorCommand } from "../command";
import { CommandExecutionResultType as ResultType, EditorCommandType } from "../command";
import { whiteSquare } from "../grid";

export function resizeGrid(newSize: number): EditorCommand {
    let previousState: string | null = null;

    function newRow(length: number) {
        return new Array(length).fill(null).map(() => whiteSquare());
    }

    function execute(crossword: Crossword) {
        const { size, grid } = crossword;
        const targetLength = newSize ** 2;

        if (newSize < 3 || newSize > 1000) {
            return {
                type: ResultType.NoOperation,
                crossword
            }
        }

        if (!crossword.grid.length) {
            crossword.grid = newRow(targetLength);
            return {
                type: ResultType.NoOperation,
                crossword
            }
        }

        if (newSize == size && crossword.grid.length == targetLength) {
            return {
                type: ResultType.NoOperation,
                crossword
            }
        } 

        previousState = JSON.stringify(crossword);

        const newGrid: Square[] = newRow(targetLength);
        const minSize = Math.min(size, newSize);

        for (let i = 0; i < minSize; i++) {
            for (let j = 0; j < minSize; j++) {
                const sourceIndex = i * size + j;
                const targetIndex = i * newSize + j;

                if (sourceIndex < grid.length) {
                    newGrid[targetIndex] = grid[sourceIndex];
                }
            }
        }

        crossword.grid = newGrid;
        crossword.size = newSize;

        return { 
            type: ResultType.Success,
            crossword
        }
    }

    function undo(crossword: Crossword) {
        if (previousState) {
            crossword = JSON.parse(previousState) as Crossword;
        }

        return crossword;
    }

    return {
        type: EditorCommandType.ResizeGrid,
        displayName: "resize grid",
        renumber: true,
        execute,
        undo
    }
}

