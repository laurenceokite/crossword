import { Iter } from "./iterators";
import { type Grid, Orientation, type Crossword, Clue, Square, type ClueMap } from "./types";

export function renumber(crossword: Crossword): [crossword: Crossword, lostClues: ClueMap] {
    const grid = numberGrid(crossword.grid, crossword.size);
    const [clues, lostClues] = updateClues(grid, crossword.clues);

    return [{ ...crossword, grid, clues }, lostClues]
}

export function numberGrid(grid: Grid, size: number): Grid {
    let number = 0;

    return grid.map((square, index) => {
        if (square.isBlack) return square;

        const leftSquare = index % size !== 0 && grid[index - 1];
        const upSquare = index >= size && grid[index - size];

        const newAcross = !leftSquare || leftSquare.isBlack;
        const newDown = !upSquare || upSquare.isBlack;

        if (newAcross || newDown) {
            number++
        }

        console.log(square.update(() => { return {} }) instanceof Square);

        return square.update(() => {
            return {
                index,
                across: newAcross ? number : leftSquare[Orientation.Down],
                down: newDown ? number : upSquare[Orientation.Across],
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
            if (map.has(number)) {
                console.log(map.get(number) instanceof Square);
                map.get(number)!.update((clue) => {
                    return {
                        indices: [...clue.indices, index]
                    }
                });
            } else {
                map.set(number, new Clue({ number }))
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
    const emptyClues = buildClues(grid);
    const concat = (clues: ClueMap): Iter<[number, Clue]> => new Iter(clues[Orientation.Across].entries())
        .concat(new Iter(clues[Orientation.Down].entries()));

    const squareMap = new Map(concat(emptyClues).map(([_, v]) => [v.key(), v]));
    const [lost, retained] = concat(oldClues).partition(([_, v]) => squareMap.has(v.key()));

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

    function partition(clues: Iter<[number, Clue]>, updateAssoc: boolean): [across: Iter<[number, Clue]>, down: Iter<[number, Clue]>] {
        return clues
            .map((pair) => (updateAssoc ? [pair[0], updateAssociations(pair[1])] : pair) as [number, Clue])
            .partition(([_, v]) => !v[Orientation.Across]());
    }

    const result = partition(retained, true);
    const lostClues = partition(lost, false);

    return [
        {
            [Orientation.Across]: new Map(result[Orientation.Across]),
            [Orientation.Down]: new Map(result[Orientation.Down])
        } as Readonly<ClueMap>,
        {
            [Orientation.Across]: new Map(lostClues[Orientation.Across]),
            [Orientation.Down]: new Map(lostClues[Orientation.Down])
        }
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


