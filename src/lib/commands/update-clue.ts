import { CommandExecutionResultType, EditorCommandType, Orientation, type Clue, type CommandExecutionResult, type Crossword, type EditorCommand } from "../types";
import { undo } from "./undo";

export function updateClueText(orientation: Orientation, number: number, value: string): EditorCommand {

    function execute(crossword: Crossword): CommandExecutionResult {
        let previousState = crossword.clues.find(clue => clue.number === number);

        if (!previousState) {
            return {
                type: CommandExecutionResultType.NoOperation,
                crossword
            };
        }

        const newState = {
            ...previousState,
            text: value
        };

        const update = (state: Clue, clues: Clue[]): Clue[] => clues.map(clue => clue.number === number ? state : clue);

        return {
            type: CommandExecutionResultType.Success,
            crossword: {
                ...crossword,
                clues: update(newState, crossword.clues)
            },
            undo: undo(updateClueText(orientation, number, value), (cw: Crossword) => {
                return {
                    ...cw,
                    clues: update(previousState, cw.clues)
                }
            })
        }
    }

    return {
        commandType: () => EditorCommandType.UpdateClue,
        displayName: () => "update clue",
        execute
    }
}

