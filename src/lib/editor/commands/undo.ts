import type { Crossword } from "../../crossword";
import { type CommandExecutionSuccess, type EditorCommand } from "../command";

export function undo(command: EditorCommand, execute: (c: Crossword) => CommandExecutionSuccess): EditorCommand {
    return {
        commandType: command.commandType,
        displayName: () => `Undo ${command.displayName()}.`,
        execute
    }
}
