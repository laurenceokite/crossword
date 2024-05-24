import { CommandExecutionResultType, EditorCommandType, Orientation, type Clue, type ClueMap, type CommandExecutionResult, type Crossword, type EditorCommand } from "../types";

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

        const update = (state: Clue): ClueMap => {
            return {
                ...crossword[orientation],
                [number]: state
            }
        };

        return {
            type: CommandExecutionResultType.NoHistory,
            crossword: {
                ...crossword,
                [orientation]: update(newState)
            },
        }
    }

    return {
        commandType: () => EditorCommandType.UpdateClue,
        displayName: () => "update clue",
        execute
    }
}

