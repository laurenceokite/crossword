import { MAX_GRID_SIZE, MIN_GRID_SIZE } from "../constants";
import { CommandExecutionResultType, EditorCommandType, type CommandExecutionResult, type Crossword, type EditorCommand, type Square } from "../types";
import { newGrid, numberGrid, newSquare, renumber } from "../grid";
import { undo } from "./undo";

export function resizeGrid(newSize: number): EditorCommand {
    function execute(crossword: Crossword): CommandExecutionResult {
        const previousSize = crossword.size;
        const targetLength = newSize ** 2;

        if (newSize < MIN_GRID_SIZE || newSize > MAX_GRID_SIZE) {
            return {
                type: CommandExecutionResultType.Void,
                crossword
            }
        }

        if (newSize === previousSize && crossword.grid.length === targetLength) {
            return {
                type: CommandExecutionResultType.Void,
                crossword
            }
        }

        if (!crossword.grid.length) {
            const grid = numberGrid(newGrid(targetLength), newSize);
            return {
                type: CommandExecutionResultType.Void,
                crossword: {
                    ...crossword,
                    grid
                }
            }
        }

        const previousState = JSON.stringify(crossword);

        const _newGrid: Square[] = [];
        const minSize = Math.min(previousSize, newSize);

        for (let row = 0; row < minSize; row++) {
            for (let col = 0; col < minSize; col++) {
                const sourceIndex = row * previousSize + col;
                const targetIndex = row * newSize + col;

                _newGrid[targetIndex] = crossword.grid[sourceIndex];
            }
        }

        if (newSize > previousSize) {
            for (let i = 0; i < targetLength; i++) {
                if (!_newGrid[i]) {
                    _newGrid[i] = newSquare(false);
                }
            }
        }

        const [cw] = renumber({ ...crossword, grid: _newGrid, size: newSize });

        return {
            type: CommandExecutionResultType.Success,
            crossword: cw,
            undo: undo(resizeGrid(newSize), () => JSON.parse(previousState) as Crossword)
        }
    }

    return {
        commandType: () => EditorCommandType.ResizeGrid,
        displayName: () => "resize grid",
        execute
    }
}

