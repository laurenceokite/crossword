import { newGrid, numberSquares } from "$lib/crossword";
import { readonly, writable } from "svelte/store";
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




const writeable = writable<EditableCrossword>();
const readable = readonly(writeable);

function load(crossword: Crossword) {
    writeable.set({
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
}

function undo() {
    writeable.update(editable => {
        const { undo, redo } = editable.history;

        const command = undo.pop();

        if (command) {
            editable = {
                ...editable,
                ...command.undo(editable)
            }
            redo.push(command);

            if (command.renumber) {
                editable = { 
                    ...editable,
                    ...numberSquares(editable),
                };
            }
        }

        return {
            ...editable,
            history: { undo, redo }
        }
    });
}

function redo() {
    writeable.update(editable => {
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
    writeable.update(editable => {
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
            ...crossword,
            history: { undo, redo }
        }
    })
}

export default {
    readable,
    load,
    undo,
    redo,
    execute
}