import { numberSquares, type Crossword } from "$lib/crossword";
import { BlackSquare, WhiteSquare, type Square } from "$lib/square";
import type { EditorCommand } from "../command";
import { CommandExecutionResultType, EditorCommandType } from "../types";

export function toggleSquare(index: number): EditorCommand {
    let previousState: Square | null = null;

    function execute(crossword: Crossword) {
        const { grid } = crossword;
        const square = grid[index] ?? null;

        if (!square) {
            return {
                type: CommandExecutionResultType.NoOperation,
                crossword
            }
        }

        previousState = square;
        grid[index] = square.isBlack 
            ? new WhiteSquare() 
            : new BlackSquare();

        crossword = numberSquares({
            ...crossword,
            ...grid
        });

        return {
            type: CommandExecutionResultType.Success,
            crossword
        };
    }

    function undo(crossword: Crossword) {
        const { grid } = crossword;
        if (previousState) {
            grid[index] = previousState;
        }
        return {
            ...crossword,
            ...grid
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