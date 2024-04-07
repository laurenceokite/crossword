import { writable } from "svelte/store";
import type { Crossword, Grid } from "../crossword";
import { CommandExecutionResultType, EditorCommandType, type EditorCommand } from "../editor/command";
import type { EditableCrossword } from "../editor/types";
import { newGrid, numberSquares } from "../editor/grid";
import { createAnswerMap } from "./answer";
import { Orientation } from "../cursor";

const { subscribe, set, update } = writable<EditableCrossword>(newEditable());

function newEditable() {
    const metadata = {
        size: 15,
    };

    const grid: Grid = numberSquares(newGrid(15), metadata.size);

    const mapClues = (orientation: Orientation) => grid.reduce((map, square) => {
        if (square.isBlack || map.has(square[orientation])) {
            return map;
        }

        return map.set(square[orientation], "");
    }, new Map());

    const clues = {
        [Orientation.Across]: mapClues(Orientation.Across),
        [Orientation.Down]: mapClues(Orientation.Down)
    }
    const answerMap = createAnswerMap(grid);
    const history = {
        undo: [],
        redo: []
    };

    return {
        grid,
        metadata,
        clues,
        answerMap,
        history
    }
}

function load(crossword: Crossword) {
    if (
        !crossword.metadata.size
        || crossword.metadata.size != crossword.grid.length
    ) {
        crossword.metadata.size = Math.ceil(Math.sqrt(crossword.grid.length));
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

type EditorHistory = {
    undo: EditorCommand[],
    redo: EditorCommand[]
};

function undoCommand() {
    update(editable => {
        const { undo, redo } = editable.history;
        const command = undo.pop();

        if (!command) {
            return {
                ...editable,
                history: { undo, redo }
            }
        }

        const result = command.execute(editable);

        if (result.type === CommandExecutionResultType.NoOperation) {
            return {
                ...editable,
                history: { undo, redo }
            };
        }

        const { commandType } = command;
        const rebuildAnswerMap = commandType() === EditorCommandType.ToggleSquare || commandType() === EditorCommandType.ResizeGrid;

        return {
            ...result.crossword,
            answerMap: rebuildAnswerMap ? createAnswerMap(result.crossword.grid) : editable.answerMap,
            history: { undo, redo }
        }

    })
}

function redoCommand(history: EditorHistory) {
    const { redo } = history;
    const command = redo.pop();

    if (command) {
        execute(command, redo);
    }
}

function execute(command: EditorCommand, redo: EditorCommand[] = []) {
    update(editable => {
        const result = command.execute(editable);
        const { undo } = editable.history;

        if (result.type === CommandExecutionResultType.NoOperation) {
            return editable;
        }

        while (undo.length > 100) {
            undo.shift();
        }

        const { commandType } = command;
        const rebuildAnswerMap = commandType() === EditorCommandType.ToggleSquare || commandType() === EditorCommandType.ResizeGrid;

        return {
            ...result.crossword,
            answerMap: rebuildAnswerMap ? createAnswerMap(result.crossword.grid) : editable.answerMap,
            history: { undo, redo }
        }
    })
}

export default {
    subscribe,
    load,
    undo: undoCommand,
    redo: redoCommand,
    execute
};
