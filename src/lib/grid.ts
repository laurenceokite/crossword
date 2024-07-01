import { Iter } from "./iterators";
import { type Grid, Orientation, type Crossword, Clue, Square, type ClueMap } from "./types";

export function renumber(crossword: Crossword): [crossword: Crossword, lostClues: ClueMap] {
    const grid = numberGrid(crossword.grid, crossword.size);
    const [clues, lostClues] = updateClues(grid, crossword.clues);

    console.log({ clues, lostClues })

    return [{ ...crossword, grid, clues }, lostClues]
}

export function numberGrid(grid: Grid, size: number): Grid {
    let number = 0;
    let across = 0;
    const down: number[] = [];

    return grid.map((square, index) => {
        if (square.isBlack) return square;

        const xPos = index % size;

        const leftSquare = xPos !== 0 && grid[index - 1];
        const upSquare = index >= size && grid[index - size];

        const newAcross = !leftSquare || leftSquare.isBlack;
        const newDown = !upSquare || upSquare.isBlack;

        if (newAcross || newDown) {
            number++
        }

        if (newAcross) {
            across = number;
        }

        if (newDown) {
            down[xPos] = number;
        }

        return square.update(() => {
            return {
                index,
                [Orientation.Across]: across,
                [Orientation.Down]: down[xPos],
                number: newAcross || newDown ? number : null
            }
        });
    });
}

export function buildClues(grid: Grid): ClueMap {
    function build(orientation: Orientation): Map<number, Clue> {
        return grid.reduce((map, square, index) => {
            if (square.isBlack) {
                return map;
            }
            const number = square[orientation];
            const clue = map.get(number);

            if (clue) {
                map.set(number, clue.update((c) => {
                    return {
                        indices: c.indices.concat(index)
                    }
                }));
            } else {
                map.set(number, new Clue({ number, orientation, indices: [index] }))
                return map;
            }
            return map;
        }, new Map<number, Clue>());
    }
    return {
        [Orientation.Across]: build(Orientation.Across),
        [Orientation.Down]: build(Orientation.Down)
    }
}

export function updateClues(grid: Grid, oldClues: ClueMap): [result: ClueMap, lostClues: ClueMap] {
    const concatClues = (clues: ClueMap): Iter<Clue> => new Iter(clues[Orientation.Across].values())
        .concat(new Iter(clues[Orientation.Down].values()));

    const clueMap = (): ClueMap => {
        return {
            [Orientation.Across]: new Map(),
            [Orientation.Down]: new Map()
        }
    };

    const updateAssociations = (clue: Clue) => {
        if (clue.associations.size) {
            return clue.update(() => {
                return {
                    associations: new Set(new Iter(clue.associations.values()).filter((k) => squareMap.has(k)))
                }
            });
        }

        return clue;
    }

    const emptyClues = buildClues(grid);
    const squareMap = new Map(concatClues(emptyClues).map((clue) => [clue.key(), clue]));
    const result = clueMap();
    const lost = clueMap();

    for (const clue of concatClues(oldClues)) {
        const key = clue.key();
        const match = squareMap.get(key);

        if (match) {
            result[clue.orientation].set(clue.number, updateAssociations(match.update(() => { return { ...clue, number: match.number } })));
            squareMap.delete(key);
        } else {
            lost[clue.orientation].set(clue.number, clue);
        }
    }

    for (const clue of squareMap.values()) {
        result[clue.orientation].set(clue.number, clue);
    }

    return [
        result,
        lost
    ]
}

export function newGrid(size: number): Grid {
    return new Array(size ** 2).fill(new Square());
}

export function isNewRow(index: number, size: number): boolean {
    return index % size === 0;
}

export function isNewColumn(index: number, size: number) {
    return index < size
}


