import { newSquare, numberSquares } from "../grid";
import { CommandExecutionResultType, EditorCommandType, type CommandExecutionResult, type Crossword, type EditorCommand } from "../types";
import { undo } from "./undo";

export function toggleSquare(index: number): EditorCommand {
    function execute(crossword: Crossword): CommandExecutionResult {
        const square = crossword.grid[index] ?? null;

        if (!square) {
            return {
                type: CommandExecutionResultType.NoOperation,
                crossword
            }
        }

        // interpolate the new square into the array et the proper index using map
        const grid = crossword.grid.map((sq, i) => i === index ? newSquare(!square.isBlack) : sq);

        return {
            type: CommandExecutionResultType.Success,
            crossword: {
                ...crossword,
                grid: numberSquares(grid, crossword.size)
            },
            undo: undo(toggleSquare(index), (crossword: Crossword) => {
                return {
                    type: CommandExecutionResultType.Success,
                    crossword: {
                        ...crossword,
                        grid: numberSquares(crossword.grid.map((sq, i) => i === index ? square : sq), crossword.size)
                    },
                    undo: toggleSquare(index)
                }
            })
        }
    }

    return {
        commandType: () => EditorCommandType.ToggleSquare,
        displayName: () => "toggle square color",
        execute
    }
}

