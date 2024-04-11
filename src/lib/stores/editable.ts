import { writable } from "svelte/store";
import type { ClueSet, Crossword } from "../crossword";
import { CommandExecutionResultType, EditorCommandType, type EditorCommand } from "../editor/command";
import type { EditableCrossword } from "../editor/types";
import { newGrid, numberSquares } from "../editor/grid";
import { createAnswerMap } from "./answer";
import type { AnswerMap } from "./types";

const { subscribe, set, update } = writable<EditableCrossword>(newEditable());

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
        const answerMap = renumber ? createAnswerMap(crossword.grid) : editable.answerMap;
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

function newEditable() {
    const metadata = {
        size: 15,
    };

    const grid = numberSquares(newGrid(15), metadata.size);

    const answerMap = createAnswerMap(grid);
    const clues = buildClues(answerMap);

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

export default {
    subscribe,
    load,
    undo: _undo,
    redo: _redo,
    execute
};
