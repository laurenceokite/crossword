import type { Readable } from "svelte/store";

export type Crossword = {
    grid: Grid;
    clues: ClueMap;
    size: number;
    title?: string;
    theme?: string;
}

export enum Orientation {
    Across,
    Down
}

export class Square {
    public isBlack: boolean;
    public index: number;
    public value: string;
    public [Orientation.Across]: number;
    public [Orientation.Down]: number;
    public number: number | null;
    public decoration: SquareDecoration | null;
    public rebus: boolean;

    constructor(init?: Partial<Square>) {
        this.isBlack = init?.isBlack ?? false;
        this.index = init?.index ?? 0;
        this.value = init?.value ?? "";
        this[Orientation.Down] = init?.[Orientation.Down] ?? 0;
        this[Orientation.Across] = init?.[Orientation.Across] ?? 0;
        this.number = init?.number ?? null;
        this.decoration = init?.decoration ?? null
        this.rebus = init?.rebus ?? false;
    };

    public update(fn: (s: Square) => Partial<Square>): Square {
        return new Square({
            ...this,
            ...fn(this)
        });
    }

    public toggle(): Square {
        return new Square({ isBlack: !this.isBlack });
    }
}

export class Clue {
    public number: number = 0;
    public orientation: Orientation = Orientation.Across;
    public text: string = "";
    public indices: ReadonlyArray<number> = [];
    public associations: ReadonlySet<string> = new Set<string>;

    constructor(init?: Partial<Clue>) {
        if (init) {
            this.number = init.number ?? 0;
            this.orientation = init.orientation ?? Orientation.Across;
            this.text = init.text ?? "";
            this.indices = init.indices ?? [];
            this.associations = init.associations ?? new Set<string>;
        }
    };

    update(fn: (c: Clue) => Partial<Clue>): Clue {
        return new Clue({
            ...this,
            ...fn(this)
        });
    }

    key() {
        return this.indices.join(",");
    }

    [Orientation.Across]() {
        return this.orientation === Orientation.Across;
    }

    [Orientation.Down]() {
        return this.orientation === Orientation.Down;
    }
}

export type Grid = ReadonlyArray<Square>;

export type ClueMap = { [K in Orientation]: Map<number, Clue> };
export enum SquareDecoration { }

export interface EditableCrossword {
    grid: Readable<Grid>;
    clues: Readable<ClueMap>;
    size: Readable<number>;
    title: () => string | undefined;
    theme: () => string | undefined;
    crossword: () => Readonly<Crossword>;

    load: (crossword: Crossword) => void;
    execute: (command: EditorCommand) => void;
    undo: () => void;
    redo: () => void;
    history: () => Readonly<EditorHistory>;
}

export type EditorHistory = {
    undo: EditorCommand[],
    redo: EditorCommand[]
}

export interface EditorCommand {
    displayName: () => string;
    execute: (crossword: Crossword) => { crossword: Crossword, undo?: EditorCommand };
}

export enum Direction {
    Left,
    Up,
    Down,
    Right,
}



export interface CursorState {
    orientation: Orientation;
    index: number;
    number: number | null;
    previousNumber: number | null;
}

