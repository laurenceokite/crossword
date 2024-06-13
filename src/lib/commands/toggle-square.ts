import { newSquare, renumber } from "../grid";
import { CommandExecutionResultType, EditorCommandType, type CommandExecutionResult, type Crossword, type EditorCommand } from "../types";
import { undo } from "./undo";

export function toggleSquare(index: number, symmetry: boolean = false): EditorCommand {
    function execute(crossword: Crossword): CommandExecutionResult {
        const square = crossword.grid[index] ?? null;

        if (!square) {
            return {
                type: CommandExecutionResultType.NoOperation,
                crossword
            }
        }

        const counterpart = symmetry ? crossword.size ** 2 - (index + 1) : -1;

        const grid = crossword.grid.map((sq, i) => (i === index || i === counterpart) ? newSquare(!square.isBlack) : sq);
        const renumberResult = renumber({ ...crossword, grid });

        return {
            type: CommandExecutionResultType.Success,
            crossword: renumberResult.crossword,
            undo: undo(toggleSquare(index, symmetry), (cw: Crossword) => {
                const across = { ...cw.across, ...renumberResult.lostClues.across };
                const down = { ...cw.down, ...renumberResult.lostClues.down };

                const result = renumber({ ...cw, grid: cw.grid.map((sq, i) => i === index ? square : sq) });

                return {
                    ...result.crossword,
                    ...across,
                    ...down,
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




