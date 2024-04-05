import type { BlackSquare, Grid } from "../crossword";
import type { Square, WhiteSquare } from "../crossword";

export function numberSquares(grid: Grid, size: number, result: Grid = [], index: number = 0, number: number = 0): Grid {
    if (index < 0 || index >= grid.length) {
        return result;
    }

    const { length } = result;

    const square = grid[index];
    const left = (length > 0 && length % size) ? result[length - 1] : null;
    const up = length > size ? result[length - size] : null;

    if (square.isBlack) {
        result.push(blackSquare());
    } else {

        const newAcross = !left || left.isBlack;
        const newDown = !up || up.isBlack;

        if (newAcross || newDown) {
            number++
        }

        result.push({
            ...square,
            across: newAcross ? number : left.across,
            down: newDown ? number : up.down
        });
    }

    return numberSquares(grid, size, result, index, number);
}

export function whiteSquare(): WhiteSquare {
    return {
        isBlack: false,
        index: 0,
        value: "",
        across: 0,
        down: 0,
        number: 0,
        decoration: null,
        rebus: false
    }
}

export function blackSquare(): BlackSquare {
    return {
        isBlack: true
    }
}

export function newGrid(size: number): Square[] {
    return new Array(size ** 2).fill(null).map(() => whiteSquare());
}

export function isNewRow(index: number, size: number): boolean {
    return index % size === 0;
}

export function isNewColumn(index: number, size: number) {
    return index < size
}
