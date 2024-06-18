import { writable } from "svelte/store";
import { type CommandExecutionResult, type Crossword, type EditableCrossword, type EditorCommand, type EditorHistory } from "../types";
import { CommandExecutionResultType } from "../types";
import { buildClues, newGrid, numberGrid } from "../grid";

const INIT_GRID_SIZE = 15;

const { subscribe, set, update } = writable<Crossword>(newCrossword());
const history: EditorHistory = {
    undo: [],
    redo: []
};


function newCrossword(): Crossword {
    const grid = numberGrid(newGrid(INIT_GRID_SIZE), INIT_GRID_SIZE);
    const clues = buildClues(grid);

    return {
        grid,
        clues,
        size: INIT_GRID_SIZE,
    }
}

function load(crossword: Crossword) {
    set(crossword);
}

function _execute(command: EditorCommand): CommandExecutionResult | null {
    let result = null;

    update(editable => {
        result = command.execute(editable);

        return result.crossword;
    });

    return result;
}

function execute(command: EditorCommand): CommandExecutionResultType {
    const result = _execute(command);

    if (result?.type === CommandExecutionResultType.Success) {
        history.undo.push(result.undo);
    }

    return result?.type ?? CommandExecutionResultType.NoOperation;
}

function undo() {
    const command = history.undo.pop();

    if (!command) {
        return;
    }

    const result = _execute(command);

    if (result?.type === CommandExecutionResultType.Success) {
        history.redo.push(result.undo);
    }

    return result?.type ?? CommandExecutionResultType.NoOperation;
}

function redo() {
    const command = history.redo.pop();

    if (!command) {
        return CommandExecutionResultType.NoOperation;
    }

    const result = _execute(command);

    if (result?.type === CommandExecutionResultType.Success) {
        history.undo.push(result.undo);
    }

    return result?.type ?? CommandExecutionResultType.NoOperation;
}

export default {
    subscribe,
    load,
    undo,
    redo,
    execute,
    history: () => history
} as EditableCrossword;
