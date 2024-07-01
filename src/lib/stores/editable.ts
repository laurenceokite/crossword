import { type Crossword, type EditableCrossword, type EditorCommand, type EditorHistory } from "../types";
import { buildClues, newGrid, numberGrid } from "../grid";
import { writable } from "svelte/store";

const history: EditorHistory = {
    undo: [],
    redo: []
};

const INIT_SIZE = 15;

const sizeStore = writable(INIT_SIZE);
const emptyGrid = newGrid(INIT_SIZE);
const grid = numberGrid(emptyGrid, INIT_SIZE);
const clues = buildClues(grid);

console.log(clues);

let crossword: Readonly<Crossword> = { grid, clues, size: INIT_SIZE };
const gridStore = writable(grid);
const clueStore = writable(clues);

function set(newValue: Crossword) {
    crossword = newValue;
    sizeStore.set(crossword.size);
    gridStore.set(crossword.grid);
    clueStore.set(crossword.clues);
}

function execute(command: EditorCommand) {
    const result = command.execute(crossword);

    if (result.undo) {
        history.undo.push(result.undo);
        set(result.crossword);
    }
}

function undo() {
    const command = history.undo.pop();

    if (!command) {
        return;
    }

    const result = command.execute(crossword);

    if (result.undo) {
        history.redo.push(result.undo);
        set(result.crossword);
    }
}

function redo() {
    const command = history.redo.pop();

    if (!command) {
        return;
    }

    const result = command.execute(crossword);

    if (result.undo) {
        history.undo.push(result.undo);
        set(result.crossword)
    }
}


export const editable: EditableCrossword = {
    grid: { subscribe: gridStore.subscribe },
    clues: { subscribe: clueStore.subscribe },
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
