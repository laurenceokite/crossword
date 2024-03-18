<script lang="ts">
    import editable from "$lib/stores/editable";
    import { type  CursorState } from "$lib/cursor";
    import { toggleSquare } from "$lib/editor/commands/toggle-square";
    import { createEventDispatcher } from "svelte";
    import type { Crossword } from "$lib/crossword";

    export let cursor: CursorState;
    export let crossword: Crossword;
    
    $: currentSquare = crossword.grid[cursor.index] ?? null;

    const dispatch = createEventDispatcher<{ toggleSquare: number }>();

</script>


<div class="grid-designer">
    {#key crossword}
    {#each crossword.grid as square, index}
        <input 
            class="grid-designer__input"
            type="checkbox" 
            value={square.isBlack}
            on:change={() => dispatch("toggleSquare", index)}
        /> 
    {/each}
    {/key}
</div>

<style lang="less">
    .grid-designer {
        opacity: .5;
        position: absolute;
        inset: 0;
        display: grid;
        grid-template-columns: repeat(var(--grid-size), 1fr);
        grid-template-rows: repeat(var(--grid-size), 1fr);
        aspect-ratio: 1;

        &__input {
            width: 100%;
            height: 100%;
        }
    }
</style>