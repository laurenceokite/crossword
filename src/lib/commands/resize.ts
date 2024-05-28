import { MAX_GRID_SIZE, MIN_GRID_SIZE } from "../constants";
import { CommandExecutionResultType, EditorCommandType, type CommandExecutionResult, type Crossword, type EditorCommand, type Square } from "../types";
import { newGrid, numberGrid, newSquare, renumber } from "../grid";
import { undo } from "./undo";

export function resizeGrid(size: number): EditorCommand {
    function execute(crossword: Crossword): CommandExecutionResult {
        const previousSize = crossword.size;
        const targetLength = size ** 2;

        if (size < MIN_GRID_SIZE || size > MAX_GRID_SIZE) {
            return {
                type: CommandExecutionResultType.NoOperation,
                crossword
            }
        }

        if (size === previousSize && crossword.grid.length === targetLength) {
            return {
                type: CommandExecutionResultType.NoOperation,
                crossword
            }
        }

        if (!crossword.grid.length) {
            const grid = numberGrid(newGrid(targetLength), size);
            return {
                type: CommandExecutionResultType.NoOperation,
                crossword: {
                    ...crossword,
                    grid
                }
            }
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
                    accumulator[i] = newSquare(false);
                }
            }
        }

        const renumberResult = renumber({ ...crossword, grid: accumulator });

        return {
            type: CommandExecutionResultType.Success,
            crossword: {
                ...renumberResult.crossword,
                size
            },
            undo: undo(resizeGrid(size), () => JSON.parse(previousState) as Crossword)
        }
    }

    return {
        commandType: () => EditorCommandType.ResizeGrid,
        displayName: () => "resize grid",
        execute
    }
}

