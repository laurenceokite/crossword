import { writable } from "svelte/store";
import type { Crossword } from "../crossword";
import { CommandExecutionResultType, type EditorCommand } from "../editor/command";
import type { EditableCrossword } from "../editor/types";
import { newGrid, numberSquares } from "../editor/grid";
import { createAnswerMap } from "./answer";

const { subscribe, set, update } = writable<EditableCrossword>(newEditable());

function newEditable() {
    const grid = newGrid(15);
    const crossword = numberSquares({
        size: 15,
        grid
    });
    const answerMap = createAnswerMap(crossword.grid);
    const history = {
        undo: [],
        redo: []
    };

    return {
        ...crossword,
        answerMap,
        history
    }
}

function load(crossword: Crossword) {
    if (!crossword.size) {
        crossword.size = Math.ceil(Math.sqrt(crossword.grid.length));
    }

    set({
        ...crossword,
        history: {
            undo: [],
            redo: []
        },
        answerMap: createAnswerMap(crossword.grid)
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
            history: { undo, redo },
            answerMap: createAnswerMap(editable.grid),
        }
    });
}

function redo() {
    update(editable => {
        const { undo, redo } = editable.history;

        const command = redo.pop();
        if (command) {
            execute(command, false);
        }

        return {
            ...editable,
            history: { undo, redo }
        }
    });
}

function execute(command: EditorCommand, clearRedoStack = true) {
    update(editable => {
        const result = command.execute(editable);
        const { undo, redo } = editable.history;
        let { crossword } = result;
        let { answerMap } = editable;

        if (result.type == CommandExecutionResultType.Success) {
            if (clearRedoStack) {
                redo.length = 0;
            }
            undo.push(command);

            while (undo.length > 100) {
                undo.shift();
            }

            if (command.renumber) {
                crossword = numberSquares(crossword);
                answerMap = createAnswerMap(crossword.grid);
            }
        }

        return {
            ...editable,
            ...crossword,
            ...answerMap,
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
};
