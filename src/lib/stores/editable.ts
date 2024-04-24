import { writable } from "svelte/store";
import { CommandExecutionResultType, EditorCommandType, type AnswerMap, type ClueSet, type Crossword, type EditableCrossword, type EditorCommand, type Grid } from "../types";
import { newGrid, numberSquares } from "../grid";

const { subscribe, set, update } = writable<EditableCrossword>(newEditable());

function load(crossword: Crossword) {
    if (
        !crossword.size
        || crossword.size != crossword.grid.length
    ) {
        crossword.size = Math.ceil(Math.sqrt(crossword.grid.length));
    }

    set({
        ...crossword,
        history: {
            undo: [],
            redo: []
        },
        answerMap: buildAnswerMap(crossword.grid)
    })
}

function execute(command: EditorCommand, redo: EditorCommand[] = [], undo?: EditorCommand[]) {
    update(editable => {
        const result = command.execute(editable);

        if (result.type === CommandExecutionResultType.NoOperation) {
            return editable;
        }

        if (!undo) {
            undo = editable.history.undo;
            undo.push(result.undo);
        } else {
            redo.push(result.undo);
        }

        while (undo.length > 100) {
            undo.shift();
        }

        const { crossword } = result;

        const { commandType } = command;
        const renumber = commandType() === EditorCommandType.ToggleSquare || commandType() === EditorCommandType.ResizeGrid;
        const answerMap = renumber ? buildAnswerMap(crossword.grid) : editable.answerMap;
        const clues = renumber ? buildClues(answerMap, crossword.clues) : crossword.clues;

        return {
            ...result.crossword,
            answerMap,
            clues,
            history: { undo, redo }
        }
    })
}

type EditorHistory = {
    undo: EditorCommand[],
    redo: EditorCommand[]
};

function _undo(history: EditorHistory) {
    const { undo, redo } = history;
    const command = undo.pop();

    if (command) {
        execute(command, redo, undo);
    }
}

function _redo(history: EditorHistory) {
    const { redo } = history;
    const command = redo.pop();

    if (command) {
        execute(command, redo);
    }
}

function newClue() {
    return { text: "", associations: [] }
};

function buildClues(answerMap: AnswerMap, clues?: ClueSet): ClueSet {
    const { across, down } = answerMap
    const updatedClues: ClueSet = {
        across: new Map(),
        down: new Map()
    }

    across.forEach((_, number) => {
        if (clues && clues.across.has(number)) {
            updatedClues.across.set(number, clues.across.get(number) ?? newClue());
        } else {
            updatedClues.across.set(number, newClue());
        }
    })

    down.forEach((_, number) => {
        if (clues && clues.down.has(number)) {
            updatedClues.down.set(number, clues.across.get(number) ?? newClue());
        } else {
            updatedClues.down.set(number, newClue());
        }
    })

    return updatedClues;
}

export function buildAnswerMap(grid: Grid): AnswerMap {
    const across = new Map<number, number[]>();
    const down = new Map<number, number[]>();

    for (let i = 0; i < grid.length; i++) {
        const square = grid[i];
        if (square.isBlack) {
            continue;
        }

        if (across.has(square.across)) {
            across.get(square.across)?.push(i);
        } else {
            across.set(square.across, [i]);
        }

        if (down.has(square.down)) {
            down.get(square.down)?.push(i);
        } else {
            down.set(square.down, [i]);
        }
    }

    return {
        across,
        down,
    }
};


function newEditable() {
    const size = 15

    const grid = numberSquares(newGrid(15), size);

    const answerMap = buildAnswerMap(grid);
    const clues = buildClues(answerMap);

    const history = {
        undo: [],
        redo: []
    };

    return {
        grid,
        size,
        clues,
        answerMap,
        history
    }
}

export default {
    subscribe,
    load,
    undo: _undo,
    redo: _redo,
    execute
};
