<script lang="ts">
    import { Orientation } from "../types";
    import ClueInput from "./ClueInput.svelte";
    import { createClueInputDispatcher } from "./clueInputDispatcher";
    import cursor from "../stores/cursor";

    export let numbers: number[];
    export let orientation: Orientation;
    export let editor: boolean = false;
    export let focusable: boolean;

    $: isSelectedOrientation = $cursor.orientation === orientation;

    const dispatch = createClueInputDispatcher();
    let focusSquares: Record<number, () => void> = {};
    let focusText: Record<number, () => void> = {};

    function changeClue(current: number, newIndex: number) {
        if (newIndex < 0 || newIndex > numbers.length - 1) return;

        const move =
            editor && current < newIndex
                ? focusText[newIndex]
                : focusSquares[newIndex];

        if (!move) return;

        move();
    }
</script>

<ul class="overflow-auto">
    <h2
        class="sticky top-0 p-2 font-semibold text-lg border-b-2 z-50"
        class:bg-white={isSelectedOrientation}
        class:bg-gray-50={!isSelectedOrientation}
    >
        {orientation === Orientation.Across ? "ACROSS" : "DOWN"}
    </h2>
    {#each numbers as number, index}
        <li class:bg-gray-100={index % 2 === 0}>
            <ClueInput
                {number}
                {editor}
                {focusable}
                {orientation}
                on:updateClue={(e) => dispatch("updateClue", e.detail)}
                on:updateValue={(e) => dispatch("updateValue", e.detail)}
                on:clearValue={(e) => dispatch("clearValue", e.detail)}
                on:previous={() => changeClue(index, index - 1)}
                on:next={() => changeClue(index, index + 1)}
                bind:focusText={focusText[index]}
                bind:focusSquares={focusSquares[index]}
            />
        </li>
    {/each}
</ul>
