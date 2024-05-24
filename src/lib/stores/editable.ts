import { writable } from "svelte/store";
import { EditorCommandType, Orientation, type ClueAssociationKey, type ClueMap, type CommandExecutionResult, type Crossword, type EditableCrossword, type EditorCommand, type EditorHistory, type Grid } from "../types";
import { CommandExecutionResultType } from "../types";
import { newGrid, numberSquares } from "../grid";

const INIT_GRID_SIZE = 15;

const { subscribe, set, update } = writable<Crossword>(newCrossword());
const history: EditorHistory = {
    undo: [],
    redo: []
};


function newCrossword(): Crossword {
    const grid = numberSquares(newGrid(INIT_GRID_SIZE), INIT_GRID_SIZE);
    const { across, down } = setClues(grid);

    return {
        grid,
        across,
        down,
        size: INIT_GRID_SIZE,
    }
}

function setClues(grid: Grid): { [K in Orientation]: ClueMap } {
    const clues = {
        across: {} as ClueMap,
        down: {} as ClueMap
    };

    for (let i = 0; i < newGrid.length; i++) {
        if (grid[i].isBlack) {
            continue;
        }
        const { across, down } = grid[i];

        const newClue = () => {
            return {
                text: "",
                associations: [],
                squares: []
            }
        }

        if (across && !clues.across[across]) {
            clues.across[across] = newClue();
        }

        if (down && !clues.down[down]) {
            clues.down[down] = newClue();
        }

        if (across) clues.across[across].squares.push(i);
        if (down) clues.down[down].squares.push(i);
    }

    return clues;
}


function renumber() {
    update(editable => {
        const grid = numberSquares(editable.grid, editable.size);
        const gridMap = mapGrid(grid);
        const newClues = setClues(grid);
        const oldClues = {
            across: editable.across,
            down: editable.down
        }

        const { across, down } = interpolateClues(newClues, oldClues, gridMap);

        return {
            ...editable,
            grid,
            across,
            down
        }
    });
}

function mapGrid(grid: Grid): Map<string, ClueAssociationKey> {
    const result = new Map<string, ClueAssociationKey>();
    const across = new Map<number, number[]>();
    const down = new Map<number, number[]>();

    for (let i = 0; i < grid.length; i++) {
        const square = grid[i];

        if (square.isBlack) {
            continue;
        }

        if (square.across !== null) {
            if (!across.has(square.across)) {
                across.set(square.across, []);
            }
            across.get(square.across)!.push(i);
        }

        if (square.down !== null) {
            if (!down.has(square.down)) {
                down.set(square.down, []);
            }
            down.get(square.down)!.push(i);
        }
    }

    across.forEach((v, k) => { result.set(JSON.stringify(v), [Orientation.Across, k]); });
    down.forEach((v, k) => { result.set(JSON.stringify(v), [Orientation.Down, k]); });

    return result;
}

function interpolateClues(
    newClues: { [K in Orientation]: ClueMap },
    oldClues: { [K in Orientation]: ClueMap },
    gridMap: Map<string, ClueAssociationKey>
): { [K in Orientation]: ClueMap } {
    const { across, down } = oldClues;
    const clues = { ...newClues };

    [...Object.values(across), ...Object.values(down)].forEach(clue => {
        const key = !!clue.text ? JSON.stringify(clue.squares) : null;

        if (key && gridMap.has(key)) {
            const value = gridMap.get(key);

            if (value) {
                const [orientation, number] = value;
                clues[orientation][number] = clue;
            }
        }
    });

    return clues;
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
    renumber
} as EditableCrossword;
