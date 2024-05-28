import { type BlackSquare, type WhiteSquare, type Grid, type ClueMap, Orientation, type Crossword, type ClueAssociationKey } from "./types";

export function renumber(crossword: Crossword): { crossword: Crossword, lostClues: { [K in Orientation]: ClueMap } } {
    const grid = numberGrid(crossword.grid, crossword.size);
    const gridMap = mapGrid(grid);
    const newClues = setClues(grid);
    const oldClues = {
        across: crossword.across,
        down: crossword.down
    }

    const [clues, lostClues] = interpolateClues(newClues, oldClues, gridMap);
    const { across, down } = clues

    return {
        crossword: {
            ...crossword,
            grid,
            across,
            down
        },
        lostClues
    };
}

export function numberGrid(
    grid: Grid,
    size: number,
    result: Grid = [],
    index: number = 0,
    number: number = 0
): Grid {
    if (index < 0 || index >= grid.length) {
        return result;
    }

    const { length } = result;

    const square = grid[index];
    const left = (length > 0 && length % size) ? result[length - 1] : null;
    const up = length > size - 1 ? result[length - size] : null;

    if (square.isBlack) {
        result.push(newSquare(true));
    } else {
        const newAcross = !left || left.isBlack;
        const newDown = !up || up.isBlack;

        if (newAcross || newDown) {
            number++
        }

        result.push({
            ...square,
            index,
            across: newAcross ? number : left.across,
            down: newDown ? number : up.down,
            number: newAcross || newDown ? number : null
        });
    }

    return numberGrid(grid, size, result, index + 1, number);
}

export function newSquare<T extends boolean>(isBlack: T): T extends true ? BlackSquare : WhiteSquare {
    if (isBlack) {
        return {
            isBlack: true,
            index: 0,
            value: null,
            across: null,
            down: null,
            number: null,
            decoration: null,
            rebus: false
        } as T extends true ? BlackSquare : WhiteSquare;
    } else {
        return {
            isBlack: false,
            index: 0,
            value: "",
            across: 0,
            down: 0,
            number: null,
            decoration: null,
            rebus: false
        } as T extends true ? BlackSquare : WhiteSquare;
    }
}

export function setClues(grid: Grid): { [K in Orientation]: ClueMap } {
    const clues = {
        across: {} as ClueMap,
        down: {} as ClueMap
    };

    for (let i = 0; i < grid.length; i++) {
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
): [{ [K in Orientation]: ClueMap }, { [K in Orientation]: ClueMap }] {
    const { across, down } = oldClues;
    const clues = { ...newClues };
    const lost = {
        across: {} as ClueMap,
        down: {} as ClueMap
    };

    Object.entries(across).forEach(([clueNumber, clue]) => {
        const key = !!clue.text ? JSON.stringify(clue.squares) : null;

        if (!key) return;

        if (gridMap.has(key)) {
            const cluePosition = gridMap.get(key);

            if (cluePosition) {
                const [_, number] = cluePosition;
                clues.across[number] = clue;
            }
        } else {
            const cn = parseInt(clueNumber);
            if (!cn) return;

            lost.across[cn] = clue;
        }
    });

    Object.entries(down).forEach(([clueNumber, clue]) => {
        const key = !!clue.text ? JSON.stringify(clue.squares) : null;

        if (!key) return;

        if (gridMap.has(key)) {
            const cluePosition = gridMap.get(key);

            if (cluePosition) {
                const [_, number] = cluePosition;
                clues.down[number] = clue;
            }
        } else {
            const cn = parseInt(clueNumber);
            if (!cn) return;

            lost.down[cn] = clue;
        }
    });

    return [clues, lost];
}


export function newGrid(size: number) {
    return new Array(size ** 2).fill(null).map(() => newSquare(false));
}

export function isNewRow(index: number, size: number): boolean {
    return index % size === 0;
}

export function isNewColumn(index: number, size: number) {
    return index < size
}
