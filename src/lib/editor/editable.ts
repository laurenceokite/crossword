
import { writable } from "svelte/store";
import type { Crossword } from "../crossword";
import { CommandExecutionResultType, type EditorCommand } from "./command";
import type { EditableCrossword } from "./types";
import { newGrid, numberSquares } from "./grid";

const { subscribe, set, update } = writable<EditableCrossword>();

function load(crossword?: Crossword) {
    const editorInit = {
        history: { undo: [], redo: [] },     
    }

    if (!crossword) {
        crossword = numberSquares({
            grid: newGrid(15),
            size: 15
        })
    }

    if (!crossword.size) {
        crossword.size = Math.ceil(Math.sqrt(crossword.grid.length));
    }

    set({
        ...crossword,
        ...editorInit
    })
}

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
            ...crossword,
            history: { undo, redo }
        }
    })
}

export default {
    subscribe,
    load,
    undo,
    redo,
    execute
}