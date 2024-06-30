import { renumber } from "../grid";
import { type Crossword, type EditorCommand, Square, Orientation } from "../types";
import { undo } from "./undo";
import { Iter } from "../iterators";

export function toggleSquare(index: number, symmetry: boolean = false): EditorCommand {
    function execute(crossword: Crossword) {
        const square = crossword.grid[index];

        if (!square) {
            return { crossword }
        }

        const counterpart = symmetry ? crossword.grid.length - (index + 1) : -1;
        const previousState: { [key: number]: Square | undefined } = {
            [index]: square,
            [counterpart]: crossword.grid[counterpart],
        };

        const grid = crossword.grid.map((sq, i) => (i === index || i === counterpart) ? new Square({ isBlack: !square.isBlack }) : sq);
        const [updatedCrossword, lostClues] = renumber({ ...crossword, grid });

        return {
            crossword: updatedCrossword,
            undo: undo(toggleSquare(index, symmetry), (cw: Crossword) => {
                const result = renumber({ ...cw, grid: cw.grid.map((sq, i) => previousState[i] ? previousState[i]! : sq) });
                const clues = {
                    [Orientation.Across]: new Map(
                        new Iter(
                            result[0].clues[Orientation.Across].entries()
                        ).map((item) => lostClues[Orientation.Across].has(item[0]) ? [item[0], lostClues[Orientation.Across].get(item[0])!] : item)
                    ),
                    [Orientation.Down]: new Map(
                        new Iter(
                            result[0].clues[Orientation.Down].entries()
                        ).map((item) => lostClues[Orientation.Down].has(item[0]) ? [item[0], lostClues[Orientation.Down].get(item[0])!] : item)

                    ),
                }
                return {
                    ...result[0],
                    clues,
                }

            })
        }
    }

    return {
        displayName: () => "toggle square color",
        execute
    }
}


