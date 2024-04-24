<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import crossword from "../stores/editable";
    import cursor, { getXIndex, getYIndex } from "../stores/cursor";

    export let focusable = true;

    const dispatch = createEventDispatcher<{
        toggleSquare: number;
    }>();

    let inputElements: HTMLInputElement[] = [];

    $: if (
        focusable &&
        inputElements.length &&
        inputElements.length > $cursor.index
    ) {
        inputElements[$cursor.index].focus();
    }

    function handleChange(index: number) {
        if ($cursor.index !== index) {
            cursor.setIndex($crossword.metadata.size, index);
        }

        dispatch("toggleSquare", index);
    }
</script>

<div
    class="grid-designer grid absolute inset-0 aspect-square"
    style="--grid-size: {$crossword.metadata.size}"
>
    {#each $crossword.grid as square, index}
        {#key $cursor}
            <div
                class:ring-4={$cursor.index === index}
                role="gridcell"
                aria-rowindex={getYIndex($crossword.size, index)}
                aria-colindex={getXIndex($crossword.size, index)}
            >
                <input
                    class="w-full h-full opacity-0"
                    type="checkbox"
                    value={square.isBlack}
                    on:change={() => handleChange(index)}
                    bind:this={inputElements[index]}
                />
            </div>
        {/key}
    {/each}
</div>

<style>
    .grid-designer {
        grid-template-columns: repeat(var(--grid-size), 1fr);
        grid-template-rows: repeat(var(--grid-size), 1fr);
    }
</style>
