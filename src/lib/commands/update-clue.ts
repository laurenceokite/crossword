import { CommandExecutionResultType, EditorCommandType, Orientation, type Clue, type ClueMap, type CommandExecutionResult, type Crossword, type EditorCommand } from "../types";
import { undo } from "./undo";

export function updateClue(orientation: Orientation, number: number, value: string): EditorCommand {

    function execute(crossword: Crossword): CommandExecutionResult {
        let previousState = crossword[orientation][number];

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

        const update = (state: Clue, map: ClueMap): ClueMap => {
            return {
                ...map,
                [number]: state
            }
        };

        return {
            type: CommandExecutionResultType.Success,
            crossword: {
                ...crossword,
                [orientation]: update(newState, crossword[orientation])
            },
            undo: undo(updateClue(orientation, number, value), (cw: Crossword) => {
                return {
                    ...cw,
                    [orientation]: update(previousState, cw[orientation])
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

