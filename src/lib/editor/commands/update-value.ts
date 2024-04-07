import type { CommandExecutionResult, EditorCommand } from "../command";
import type { Grid, Square, WhiteSquare } from "../../crossword";
import { CommandExecutionResultType, EditorCommandType } from "../command";
import type { Crossword } from "../../crossword";
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
                (crossword: Crossword) => {
                    return {
                        type: CommandExecutionResultType.Success,
                        crossword: {
                            ...crossword,
                            grid: crossword.grid.map((sq, i) => i === index ? previousState : sq)
                        },
                        undo: updateValue(index, value)
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

