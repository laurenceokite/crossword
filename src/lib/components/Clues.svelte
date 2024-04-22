<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { WhiteSquare } from "../crossword";
    import { Orientation } from "../cursor";
    import cursor from "../stores/cursor";
    import editable from "../stores/editable";
    import ClueInput from "./ClueInput.svelte";

    export let focused = false;
    export let editor = false;

    const dispatch = createEventDispatcher<{
        selectSquare: number;
        updateValue: [number, string];
    }>();

    const crossword = editable;

    $: square = $crossword.grid[$cursor.index] ?? null;
    $: currentNumber = !square.isBlack
        ? { across: square.across, down: square.down }
        : null;

    let answerSquares: {
        across: Map<number, WhiteSquare[]>;
        down: Map<number, WhiteSquare[]>;
    };

    $: answerSquares = {
        across: buildSquareMap($crossword.answerMap.across),
        down: buildSquareMap($crossword.answerMap.down),
    };

    function buildSquareMap(
        answerMap: Map<number, number[]>,
    ): Map<number, WhiteSquare[]> {
        const result: Map<number, WhiteSquare[]> = new Map();

        answerMap.forEach((indices, number) => {
            const squares: WhiteSquare[] = [];
            indices.forEach((i) => {
                const s = $crossword.grid[i] ?? null;

                if (s && !s.isBlack) {
                    squares.push(s);
                }
            });
            result.set(number, squares);
        });

        return result;
    }

    function getSquares(
        orientation: Orientation,
        number: number,
    ): WhiteSquare[] | [] {
        return answerSquares[orientation].get(number) ?? [];
    }

    function handleSelectSquare(event: CustomEvent<number>) {
        if ($cursor.index === event.detail) return;

        cursor.setIndex($crossword.metadata.size, event.detail);
        dispatch("selectSquare", event.detail);
    }

    function handleUpdateValue(event: CustomEvent<[number, string]>) {
        const { orientation } = $cursor;
        const word = currentNumber
            ? answerSquares[orientation].get(currentNumber[orientation])
            : null;

        if (!word || !word.length) return;

        dispatch("updateValue", event.detail);

        const index = word.findIndex((s) => s.index === $cursor.index);

        if (index >= word.length - 1) return;

        const nextSquare = word[index + 1];

        if (!nextSquare) return;

        cursor.setIndex($crossword.metadata.size, nextSquare.index);
    }
</script>

<div>
    <ul>
        {#each [...$crossword.clues.across.entries()] as [number, clue] (number)}
            <li>
                <ClueInput
                    {clue}
                    {number}
                    focused={focused &&
                        !!currentNumber &&
                        currentNumber[$cursor.orientation] === number}
                    {editor}
                    currentNumber={currentNumber ? currentNumber.across : null}
                    cursor={$cursor}
                    squares={getSquares(Orientation.Across, number)}
                    on:updateValue={handleUpdateValue}
                    on:selectSquare={handleSelectSquare}
                />
            </li>
        {/each}
    </ul>
    <ul>
        {#each [...$crossword.clues.down.entries()] as [number, clue] (number)}
            <li></li>
        {/each}
    </ul>
</div>
