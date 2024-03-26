import type { BlackSquare, Crossword } from "../crossword";
import type { Square, WhiteSquare } from "../crossword";

function numberWord(grid: Square[], size: number, orientation: "across" | "down", index: number, number: number) {
    if (!grid[index] || grid[index].isBlack) {
        return;
    }

    (grid[index] as WhiteSquare)[orientation] = number;

    const isNewLine = orientation == "across" ? isNewRow : isNewColumn;
    const increment = orientation == "across" ? 1 : size;
    let i = index + increment;

    while (
        grid[i] 
        && !grid[i].isBlack
        && !isNewLine(i, size)
    ) {
        (grid[i] as WhiteSquare)[orientation] = number;
        i += increment;
    }
}

export function numberSquares(crossword: Crossword): Crossword {
    if (!crossword.grid.length) {
        return crossword;
    }
    
    const grid = [...crossword.grid];
    const { size } = crossword;
    let number = 1;

    for (let i = 0; i < crossword.grid.length; i++) {
        const square = grid[i];

        if (square.isBlack) continue;

        (grid[i] as WhiteSquare).index = i;
        const uidx = i - size;
        const up = uidx >= 0 ? grid[uidx] : null;
        const left = i > 0 ? grid[i - 1] : null;

        let increment = false;

        if (
            isNewRow(i, size) 
            || left?.isBlack
        ) {
            increment = true;
            numberWord(grid, size, "across", i, number);
        } 
        
        if (
            isNewColumn(i, size)
            || up?.isBlack
        ) {
            increment = true;
            numberWord(grid, size, "down", i, number);
        }

        if (increment) {
            (grid[i] as WhiteSquare).number = number;
            number++
        }
    }

    return {
        ...crossword,
        grid
    };
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
};

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