import type { Crossword, Square } from "../../crossword";
import type { EditorCommand } from "../command";
import { whiteSquare, blackSquare } from "../grid";
import { CommandExecutionResultType, EditorCommandType } from "../command";

export function toggleSquare(index: number): EditorCommand {
    let previousState: Square | null = null;

    function execute(crossword: Crossword) {
        const grid = [...crossword.grid];
        const square = grid[index] ?? null;

        if (!square) {
            return {
                type: CommandExecutionResultType.NoOperation,
                crossword
            }
        }

        previousState = square;
        grid[index] = square.isBlack
            ? whiteSquare()
            : blackSquare();

        crossword.grid = grid;

        return {
            type: CommandExecutionResultType.Success,
            crossword
        };
    }

    function undo(crossword: Crossword) {
        const grid = [...crossword.grid];
        if (previousState) {
            grid[index] = previousState;
        }
        return {
            ...crossword,
            grid
        }
    }

    return {
        type: EditorCommandType.ToggleSquare,
        displayName: "toggle square color",
        renumber: true,
        execute,
        undo
    }
}
