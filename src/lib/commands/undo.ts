import type { CommandExecutionSuccess, Crossword, EditorCommand } from "../types";

export function undo(command: EditorCommand, execute: (c: Crossword) => CommandExecutionSuccess): EditorCommand {
    return {
        commandType: command.commandType,
        displayName: () => `Undo ${command.displayName()}.`,
        execute
    }
}
