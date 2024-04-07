import type { Crossword } from "../../crossword";
import type { CommandExecutionResult, EditorCommand } from "../command";
import { whiteSquare, blackSquare, numberSquares } from "../grid";
import { CommandExecutionResultType, EditorCommandType } from "../command";
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

        const previousState = square;
        const newSquare = square.isBlack
            ? whiteSquare
            : blackSquare;

        const grid = crossword.grid.map((sq, i) => i === index ? newSquare() : sq);

        return {
            type: CommandExecutionResultType.Success,
            crossword: {
                ...crossword,
                grid: numberSquares(grid, crossword.metadata.size)
            },
            undo: undo(toggleSquare(index), (crossword: Crossword) => {
                return {
                    type: CommandExecutionResultType.Success,
                    crossword: {
                        ...crossword,
                        grid: numberSquares(crossword.grid.map((sq, i) => i === index ? previousState : sq), crossword.metadata.size)
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

