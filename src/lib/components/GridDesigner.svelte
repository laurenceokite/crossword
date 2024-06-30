<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { editable } from "../stores/editable";
    import { cursor, getXIndex, getYIndex } from "../stores/cursor";

    export let focusable = true;
    export const focus = () => {
        inputElements[$cursor.index]?.focus();
    };

    const dispatch = createEventDispatcher<{
        toggleSquare: number;
    }>();

    let inputElements: HTMLInputElement[] = [];
    const { grid, size } = editable;

    $: if (focusable && inputElements.length && inputElements[$cursor.index]) {
        inputElements[$cursor.index].focus();
    }

    function handleChange(index: number) {
        if ($cursor.index !== index) {
            cursor.setIndex(editable.crossword(), index);
        }

        dispatch("toggleSquare", index);
    }
</script>

<div
    class="grid-designer grid absolute inset-0 aspect-square"
    style="--grid-size: {$size}"
>
    {#each $grid as square, index}
        {#key $cursor}
            <div
                class:ring-4={$cursor.index === index}
                role="gridcell"
                aria-rowindex={getYIndex($size, index)}
                aria-colindex={getXIndex($size, index)}
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
