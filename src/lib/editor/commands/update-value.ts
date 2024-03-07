import type { EditorCommand } from "../command";
import type { Square, WhiteSquare } from "$lib/crossword";
import { CommandExecutionResultType, EditorCommandType } from "../command";
import type { Crossword } from "$lib/crossword";

export function updateValue(index: number, value: string): EditorCommand {
    let previousState: Square | null = null;

    function execute(crossword: Crossword) {
        if (
            !crossword.grid[index]
            || crossword.grid[index].isBlack
        ) {
            return {
                type: CommandExecutionResultType.NoOperation,
                crossword 
            }
        }

        const grid = [...crossword.grid];
        const square = grid[index] as WhiteSquare;
        value = value.toUpperCase();

        previousState = square;
        grid[index] = {
            ...square,
            value,
            rebus: value.length > 1
        }

        return {
            type: CommandExecutionResultType.Success,
            crossword: {
                ...crossword,
                grid
            }
        }
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
        type: EditorCommandType.UpdateValue,
        displayName: "update value",
        renumber: false,
        execute,
        undo
    }
}