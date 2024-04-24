import type { BlackSquare, WhiteSquare, Grid } from "./types";

export function numberSquares(grid: Grid, size: number, result: Grid = [], index: number = 0, number: number = 0): Grid {
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

    return numberSquares(grid, size, result, index + 1, number);
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

export function newGrid(size: number) {
    return new Array(size ** 2).fill(null).map(() => newSquare(false));
}

export function isNewRow(index: number, size: number): boolean {
    return index % size === 0;
}

export function isNewColumn(index: number, size: number) {
    return index < size
}
