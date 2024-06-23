import { newSquare, renumber } from "../grid";
import { CommandExecutionResultType, EditorCommandType, type CommandExecutionResult, type Crossword, type EditorCommand } from "../types";
import { undo } from "./undo";

export function toggleSquare(index: number, symmetry: boolean = false): EditorCommand {
    function execute(crossword: Crossword): CommandExecutionResult {
        const square = crossword.grid[index] ?? null;

        if (!square) {
            return {
                type: CommandExecutionResultType.Void,
                crossword
            }
        }

        const counterpart = symmetry ? crossword.grid.length - (index + 1) : null;
        const previousState = {
            [index]: square,
            ...(() => {
                if (counterpart !== null) {
                    return { [counterpart]: crossword.grid[counterpart] ?? null }
                }
            })(),
        };

        const grid = crossword.grid.map((sq, i) => (i === index || i === counterpart) ? newSquare(!square.isBlack) : sq);
        const [updatedCrossword, lostClues] = renumber({ ...crossword, grid });

        return {
            type: CommandExecutionResultType.Success,
            crossword: updatedCrossword,
            undo: undo(toggleSquare(index, symmetry), (cw: Crossword) => {
                const clues = [...crossword.clues, ...lostClues];

                const result = renumber({ ...cw, grid: cw.grid.map((sq, i) => previousState[i] ? previousState[i] : sq) });

                return {
                    ...result[0],
                    clues,
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




