<script lang="ts">
    import { Orientation, type WhiteSquare } from "../types";
    import ClueInput from "./ClueInput.svelte";
    import { createClueInputDispatcher } from "./clueInputDispatcher";
    import cursor from "../stores/cursor";
    import { editable } from "../stores/editable";

    export let editor: boolean = false;
    export let focusable: boolean;
    export let orientation: Orientation;

    const dispatch = createClueInputDispatcher();
    const focusSquares: (() => void)[] = [];
    const focusText: (() => void)[] = [];
    const { clues: clueStore, grid } = editable;

    $: clues = $clueStore
        .toSeq()
        .filter((c) => c.get("orientation") === orientation)
        .mapKeys((indices) => indices.map((i) => $grid.get(i) as WhiteSquare));

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
    {#each clues.entries() as [squares, clue], index}
        <li class:bg-gray-100={index % 2 === 0}>
            <ClueInput
                {squares}
                {clue}
                {editor}
                {focusable}
                on:updateClue={(e) => dispatch("updateClue", e.detail)}
                on:updateValue={(e) => dispatch("updateValue", e.detail)}
                on:clearValue={(e) => dispatch("clearValue", e.detail)}
                on:previous={() => move(index, index - 1)}
                on:next={() => move(index, index + 1)}
                bind:focusText={focusText[index]}
                bind:focusSquares={focusSquares[index]}
            />
        </li>
    {/each}
</ul>
