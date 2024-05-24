import { CommandExecutionResultType, type Crossword, type EditorCommand } from "../types";

export function undo(command: EditorCommand, callback: (c: Crossword) => Crossword): EditorCommand {
    return {
        commandType: command.commandType,
        displayName: () => `Undo ${command.displayName()}.`,
        execute: (c: Crossword) => {
            return {
                type: CommandExecutionResultType.Success,
                crossword: callback(c),
                undo: command
            }
        }
    }
}
