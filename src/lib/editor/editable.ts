import { newGrid, numberSquares } from "$lib/crossword";
import { writable } from "svelte/store";
import type { Crossword } from "../crossword";
import type { EditorCommand } from "./command";
import { CommandExecutionResultType, EditMode, Orientation } from "./types";

export interface EditableCrossword extends Crossword {
    history: { undo: EditorCommand[], redo: EditorCommand[] };
    orientation: Orientation,
    mode: EditMode,
    cursor: {
        index: number,
        x: number,
        y: number
    }
}

export function createEditable(crossword: Crossword) {
    const { subscribe, update } = writable<EditableCrossword>({
        ...crossword,
        grid: crossword.grid.length ? crossword.grid : newGrid(crossword.size),
        history: { undo: [], redo: [] },
        orientation: Orientation.Across,
        mode: EditMode.Grid,
        cursor: {
            index: 0,
            x: 0,
            y: 0,
        }
    }) 

    function undo() {
        update(editable => {
            const { undo, redo } = editable.history;

            const command = undo.pop();

            if (command) {
                editable = {
                    ...editable,
                    ...command.undo(editable)
                }
                redo.push(command);

                if (command.renumber) {
                    crossword = numberSquares(crossword);
                }
            }

            return {
                ...editable,
                history: { undo, redo }
            }
        });
    }

    function redo() {
        update(editable => {
            const { undo, redo } = editable.history;

            const command = redo.pop();
            if (command) {
                execute(command);
            }

            return {
                ...editable,
                history: { undo, redo }
            }
        });
    } 

    function execute(command: EditorCommand) {
        update(editable => {
            const result = command.execute(editable);
            const { undo, redo } = editable.history;
            let { crossword } = result;

            if (result.type == CommandExecutionResultType.Success) {
                redo.length = 0;
                undo.push(command);

                while (undo.length > 1000) {
                    undo.shift();
                }

                if (command.renumber) {
                    crossword = numberSquares(crossword);
                }
            }

            return {
                ...editable,
                ...result.crossword,
                history: { undo, redo }
            }
        })
    }

    return {
        subscribe,
        undo,
        redo,
        execute
    }
}

