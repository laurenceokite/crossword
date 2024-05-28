import { newSquare, renumber } from "../grid";
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

        const grid = crossword.grid.map((sq, i) => i === index ? newSquare(!square.isBlack) : sq);
        const renumberResult = renumber({ ...crossword, grid });

        return {
            type: CommandExecutionResultType.Success,
            crossword: renumberResult.crossword,
            undo: undo(toggleSquare(index), (cw: Crossword) => {
                const across = { ...cw.across, ...renumberResult.lostClues.across };
                const down = { ...cw.down, ...renumberResult.lostClues.down };

                return renumber({ ...cw, grid: cw.grid.map((sq, i) => i === index ? square : sq) }).crossword;
            })
        }
    }

    return {
        commandType: () => EditorCommandType.ToggleSquare,
        displayName: () => "toggle square color",
        execute
    }
}




