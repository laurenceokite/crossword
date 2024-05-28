import { CommandExecutionResultType, EditorCommandType, type CommandExecutionResult, type Crossword, type EditorCommand } from "../types";
import { undo } from "./undo";

export function updateValue(index: number, value: string): EditorCommand {
    function execute(crossword: Crossword): CommandExecutionResult {
        const square = crossword.grid[index] ?? null;

        if (
            !square
            || square.isBlack
        ) {
            return {
                type: CommandExecutionResultType.NoOperation,
                crossword
            }
        }

        const previousState = square;
        const newSquare = {
            ...square,
            value: value.toUpperCase(),
            rebus: value.length > 1
        }

        const grid = crossword.grid.map((sq, i) => i === index ? newSquare : sq);

        return {
            type: CommandExecutionResultType.Success,
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
        commandType: () => EditorCommandType.UpdateValue,
        displayName: () => "update value",
        execute
    }
}

