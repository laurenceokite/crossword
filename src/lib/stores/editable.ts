import { type CommandExecutionResult, type Crossword, type EditableCrossword, type EditorCommand, type EditorHistory } from "../types";
import { CommandExecutionResultType } from "../types";
import { buildClues, newGrid, numberGrid } from "../grid";
import { writable } from "./writable";
import { derived } from "svelte/store";

const history: EditorHistory = {
    undo: [],
    redo: []
};

const INIT_SIZE = 15;

const sizeStore = writable(INIT_SIZE);
const grid = numberGrid(newGrid(INIT_SIZE), INIT_SIZE);
const clues = buildClues(grid);

let crossword: Readonly<Crossword> = Object.freeze({ grid, clues, size: INIT_SIZE });
const gridStore = writable(grid);
const _clueStore = writable(clues);

function set(newValue: Crossword) {
    crossword = newValue;
    sizeStore.set(newValue.size);
    gridStore.set(newValue.grid);
    _clueStore.set(newValue.clues);
}

function _execute(command: EditorCommand): CommandExecutionResult | null {
    const result = command.execute(crossword);

    set(result.crossword);

    return Object.freeze(result);
}

function execute(command: EditorCommand) {
    const result = _execute(command);

    if (result?.type === CommandExecutionResultType.Success) {
        history.undo.push(result.undo);
    }
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

    return result?.type ?? CommandExecutionResultType.Void;
}

function redo() {
    const command = history.redo.pop();

    if (!command) {
        return CommandExecutionResultType.Void;
    }

    const result = _execute(command);

    if (result?.type === CommandExecutionResultType.Success) {
        history.undo.push(result.undo);
    }

    return result?.type ?? CommandExecutionResultType.Void;
}

export const clueStore = derived(_clueStore, ($clues) => $clues.mapKeys((_, c) => c.get('number')));
export const wordSquareStore = derived(clueStore, ($clues) => $clues.map(c => c.get('indices').map(i => crossword.grid.get(i)).toList()));

export const editable: EditableCrossword = {
    grid: { subscribe: gridStore.subscribe },
    clues: { subscribe: _clueStore.subscribe },
    size: { subscribe: sizeStore.subscribe },
    crossword: () => crossword,
    title: () => crossword.title,
    theme: () => crossword.theme,
    load: set,
    undo,
    redo,
    execute,
    history: () => history
};
