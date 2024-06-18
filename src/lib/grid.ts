import { Collection, List, Map, Record, Set, merge, mergeWith } from "immutable";
import { type BlackSquare, type WhiteSquare, type Grid, Orientation, type Crossword, type Clue, type Square, type ClueMap } from "./types";

export function renumber(crossword: Crossword): [crossword: Crossword, lostClues: Clue[]] {
    return interpolateGrid(crossword, numberGrid(crossword.grid, crossword.size));
}

export function numberGrid(grid: Grid, size: number): Grid {
    let number = 0;

    return grid.map((square, index) => {
        if (square.isBlack) return newSquare(true);

        const leftSquare = grid.get(index - 1) ?? null;
        const upSquare = grid.get(index - size) ?? null;

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
        value: "",
        [Orientation.Across]: 0,
        [Orientation.Down]: 0,
        number: null,
        decoration: null,
        rebus: false
    };
}

export function newClue(number: number, orientation: Orientation): Clue {
    return Record({
        orientation,
        number,
        text: "",
        associations: List<Set<number>>(),
        indices: Set<number>()
    })();
}

export function buildClues(grid: Grid): ClueMap {
    const build = (orientation: Orientation): ClueMap => grid
        .map(s => s.isBlack ? undefined : s[orientation])
        .reduce((map, number, index) => {
            if (number === undefined) return map;

            const key = List([number, orientation]);

            const value = map.get(key, newClue(number, orientation));
            const indices = value.get('indices').add(index);

            return map.set(key, value.set('indices', indices));
        }, Map<List<number>, Clue>())
        .mapKeys((_, v) => v.get('indices'));

    return build(Orientation.Across).merge(build(Orientation.Down));
}

export function updateClues(grid: Grid, oldClues: ClueMap): [result: ClueMap, lostClues: ClueMap] {
    const newClues = buildClues(grid);
    const [retainedClues, lostClues] = oldClues.partition((_, k) => newClues.has(k));

    const updateAssociations = (clue: Clue) => clue
        .set('associations', clue.get('associations')
            .filter(k => newClues.has(k)));

    return [
        newClues
            .mergeWith((nClue, rClue) => rClue.set('number', nClue.get('number')), retainedClues.map(updateAssociations)),
        lostClues
    ]
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
