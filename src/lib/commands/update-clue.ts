import { Orientation, type Clue, type ClueMap, type CommandExecutionResult, type Crossword, type EditorCommand } from "../types";
import { undo } from "./undo";

export function updateClueText(orientation: Orientation, number: number, value: string): EditorCommand {

    function execute(crossword: Crossword): CommandExecutionResult {
        let previousState = crossword.clues[orientation].get(number);

        if (!previousState) {
            return { crossword };
        }

        const newState = previousState.update(() => { return { text: value } });

        return {
            crossword: {
                ...crossword,
                clues: {
                    ...crossword.clues,
                    [orientation]: new Map(crossword.clues[orientation].entries()).set(number, newState) as Map<number, Clue>
                }
            },
            undo: undo(updateClueText(orientation, number, value), (cw: Crossword) => {
                return {
                    ...cw,
                    clues: {
                        ...crossword.clues,
                        [orientation]: new Map(crossword.clues[orientation].entries()).set(number, previousState) as Map<number, Clue>
                    }
                }
            })
        }
    }

    return {
        displayName: () => "update clue text",
        execute
    }
}

