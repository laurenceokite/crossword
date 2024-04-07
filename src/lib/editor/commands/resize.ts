import { MAX_GRID_SIZE, MIN_GRID_SIZE } from "../../constants";
import type { Crossword, WhiteSquare, Square } from "../../crossword";
import type { CommandExecutionResult, EditorCommand } from "../command";
import { EditorCommandType, CommandExecutionResultType as ResultType } from "../command";
import { newGrid, numberSquares, whiteSquare } from "../grid";
import { undo } from "./undo";

export function resizeGrid(size: number): EditorCommand {
    function execute(crossword: Crossword): CommandExecutionResult {
        const previousSize = crossword.metadata.size;
        const targetLength = size ** 2;

        if (size < MIN_GRID_SIZE || size > MAX_GRID_SIZE) {
            return {
                type: ResultType.NoOperation,
                crossword
            }
        }

        if (size === previousSize && crossword.grid.length === targetLength) {
            return {
                type: ResultType.NoOperation,
                crossword
            }
        }

        if (!crossword.grid.length) {
            const grid = numberSquares(newGrid(targetLength), size);
            return {
                type: ResultType.NoOperation,
                crossword: {
                    ...crossword,
                    grid
                }
            }
        }

        const metadata = {
            ...crossword.metadata,
            size
        }
        const previousState = JSON.stringify(crossword);

        const accumulator: Square[] = [];
        const minSize = Math.min(previousSize, size);

        for (let i = 0; i < minSize; i++) {
            for (let j = 0; j < minSize; j++) {
                const sourceIndex = i * previousSize + j;
                const targetIndex = i * size + j;

                if (sourceIndex < targetLength) {
                    accumulator[targetIndex] = crossword.grid[sourceIndex];
                }
            }
        }

        if (size < previousSize) {
            for (let i = 0; i < targetLength; i++) {
                if (!accumulator[i]) {
                    accumulator[i] = whiteSquare();
                }
            }
        }

        const grid = numberSquares(accumulator, size)

        return {
            type: ResultType.Success,
            crossword: {
                ...crossword,
                grid,
                metadata
            },
            undo: undo(resizeGrid(size), () => {
                return {
                    type: ResultType.Success,
                    crossword: JSON.parse(previousState) as Crossword,
                    undo: resizeGrid(size)
                }
            })
        }
    }

    return {
        commandType: () => EditorCommandType.ResizeGrid,
        displayName: () => "resize grid",
        execute
    }
}

