<script lang="ts">
    import editable from "$lib/editor/editable";
    import { type  CursorState } from "$lib/cursor";

    export let disabled = false;
    export let cursor: CursorState;

    const crossword = $editable;
    
    $: currentSquare = crossword.grid[cursor.index] ?? null;

</script>


<div class="grid-designer">
    {#each crossword.grid as square}
        <input 
            class="grid-designer__input"
            type="checkbox" 
            
        /> 
    {/each}
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