export enum SquareDecoration {}

export type Square = WhiteSquare | BlackSquare;

export class WhiteSquare {
    readonly isBlack = false;
    value: string = "";
    across: number = 0;
    down: number = 0;
    number: number | null = null;
    decoration: SquareDecoration | null = null;
    rebus: boolean = false;
}

export class BlackSquare {
    readonly isBlack = true;
}
