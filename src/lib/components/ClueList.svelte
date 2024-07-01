<script lang="ts">
    import { Orientation, Square } from "../types";
    import ClueInput from "./ClueInput.svelte";
    import { createClueInputDispatcher } from "./clueInputDispatcher";
    import { cursor } from "../stores/cursor";
    import { editable } from "../stores/editable";

    export let editor: boolean = false;
    export let focusable: boolean;
    export let orientation: Orientation;

    const dispatch = createClueInputDispatcher();
    const focusSquares: (() => void)[] = [];
    const focusText: (() => void)[] = [];
    const { clues, grid } = editable;
    let goToNextEmpty = true;

    $: if (!focusable) {
        goToNextEmpty = true;
    }

    $: squares = $grid.reduce((map, square) => {
        if (square.isBlack) {
            return map;
        }
        const number = square[orientation];
        map.set(
            number,
            map.has(number) ? [...map.get(number)!, square] : [square],
        );
        return map;
    }, new Map<number, Square[]>());

    function move(currentIndex: number, newIndex: number) {
        const _move =
            editor && currentIndex < newIndex
                ? focusText[newIndex]
                : focusSquares[newIndex];

        if (!_move) return;

        _move();
    }
</script>

<ul class="overflow-auto">
    <h2
        class="sticky top-0 p-2 font-semibold text-lg border-b-2 z-50"
        class:bg-white={$cursor.orientation === orientation}
        class:bg-gray-50={!($cursor.orientation === orientation)}
    >
        {orientation === Orientation.Across ? "ACROSS" : "DOWN"}
    </h2>
    {#each [...$clues[orientation].values()].sort((a, b) => a.number - b.number) as clue, index}
        <li class:bg-gray-100={index % 2 === 0}>
            <ClueInput
                {clue}
                {editor}
                {focusable}
                squares={squares.get(clue.number) ?? []}
                on:updateClue={(e) => dispatch("updateClue", e.detail)}
                on:updateValue={(e) => dispatch("updateValue", e.detail)}
                on:clearValue={(e) => dispatch("clearValue", e.detail)}
                on:previous={() => move(index, index - 1)}
                on:next={() => move(index, index + 1)}
                bind:focusText={focusText[index]}
                bind:focusSquares={focusSquares[index]}
                bind:goToNextEmpty
            />
        </li>
    {/each}
</ul>
