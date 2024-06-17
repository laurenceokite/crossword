import { type BlackSquare, type WhiteSquare, type Grid, Orientation, type Crossword, type Clue, type Square } from "./types";

export function renumber(crossword: Crossword): [crossword: Crossword, lostClues: Clue[]] {
    return interpolateGrid(crossword, numberGrid(crossword.grid, crossword.size));
}

export function numberGrid(grid: Grid, size: number): Grid {
    let number = 0;

    return grid.map((square, index) => {
        if (square.isBlack) return newSquare(true);

        const leftSquare = grid[index - 1] ?? null;
        const upSquare = grid[index - size] ?? null;

        const newAcross = !leftSquare || leftSquare.isBlack;
        const newDown = !upSquare || upSquare.isBlack;

        if (newAcross || newDown) {
            number++
        }

        return {
            ...square,
            index,
            across: newAcross ? number : leftSquare[Orientation.Down],
            down: newDown ? number : upSquare[Orientation.Across],
            number: newAcross || newDown ? number : null
        };
    });
}

export function newSquare(isBlack: boolean): Square {
    return isBlack ? { isBlack } : {
        isBlack,
        index: 0,
        value: "",
        [Orientation.Across]: 0,
        [Orientation.Down]: 0,
        number: null,
        decoration: null,
        rebus: false
    };
}

export function buildClues(grid: Grid): Clue[] {
    const newClue = (orientation: Orientation, number: number): Clue => {
        return {
            orientation,
            number,
            text: "",
            associations: [],
            indices: []
        }
    }

    const clues = grid.reduce((map, square, index) => {
        if (square.isBlack) {
            return map;
        }

        [Orientation.Across, Orientation.Down].forEach(orientation => {
            const number = square[orientation];
            const key = `${orientation}:${number}`;

            if (!map.has(key)) {
                map.set(key, newClue(number, orientation));
            }

            map.get(key)?.indices.push(index);
        });

        return map;
    }, new Map<string, Clue>());

    return Object.values(clues);
}

export function interpolateGrid(crossword: Crossword, grid: Grid): [result: Crossword, lostClues: Clue[]] {
    const newGridSize = Math.sqrt(grid.length);
    const sizeDelta = newGridSize - crossword.size;
    const oldClues = new Map(crossword.clues.map(c => [`${c.number}:${c.orientation}`, c]));
    const keys = new Set<string>();

    const adjustIndex = (n: number) => {
        if (!sizeDelta) return n;
        return Math.floor(n / crossword.size) * sizeDelta + n;
    };

    const compare = (i: number, n: number, o: Orientation) => {
        if (!crossword.grid[i] || crossword.grid[i].isBlack) {
            return false;
        }

        return (crossword.grid[i] as WhiteSquare)[o] === n;
    }

    const clues = buildClues(grid).map((clue) => {
        const firstSquare = crossword.grid[adjustIndex(clue.indices[0])];

        if (!firstSquare || firstSquare.isBlack) {
            return clue;
        }

        if (clue.indices.every(i => compare(i, firstSquare[clue.orientation], clue.orientation))) {
            const key = `${clue.number}:${clue.orientation}`;

            if (oldClues.has(key)) {
                keys.add(key);
                const oldClue = oldClues.get(key);

                const associations = oldClue?.associations.map(assoc =>
                    assoc.map(a => adjustIndex(a))
                ).filter(assoc => {
                    if (!assoc.length || grid[assoc[0]] || grid[assoc[0]].isBlack) {
                        return false;
                    }
                    const number = (grid[assoc[0]] as WhiteSquare)[clue.orientation];

                    return assoc.every(i => grid[i] && !grid[i].isBlack && (grid[i] as WhiteSquare)[clue.orientation] === number);
                }) ?? [];

                return {
                    ...clue,
                    ...oldClue,
                    associations,
                    number: clue.number,
                    orientation: clue.orientation
                }
            }

        }

        return clue;
    });

    return [{ ...crossword, grid: grid, clues }, Object.entries(oldClues).filter(([key]) => !keys.has(key)).map(([_, v]) => v)];
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
