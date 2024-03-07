<script lang="ts">
    import editable from "$lib/editor/editable";
    import type { Square } from "$lib/crossword";
    import type { CursorState } from "$lib/cursor";
    import { Orientation } from "$lib/types";

    export let editMode = true;
    export let disabled = false;
    export let cursor: CursorState = {
        orientation: Orientation.Across,
        index: 0
    };

    const crossword = editMode ? $editable : $editable;
    $: selectedSquare = crossword.grid[cursor.index];

    function isHighlighted(square: Square, index: number) {
        
    } 

</script>

<div class="input-grid" style={`--grid-size: ${crossword.size}`}>
    {#each crossword.grid as square, index}
        <div
            class="input-grid__square-container"
        > 
            {#if !square.isBlack}
                {#if square.number}
                    <div class="input-grid__number">
                        { square.number }
                    </div>
                {/if}
                <input 
                    type="text" 
                    class="input-grid__square"
                    value={square.value} 
                />
            {/if}
        </div> 
    {/each}
</div>


<style>
.input-grid { 
    display: grid;
    grid-template-columns: repeat(var(--grid-size), 1fr);
    grid-template-rows: repeat(var(--grid-size), 1fr);

    &__square-container {
        aspect-ratio: 1;
    }

    & .highlight {
        outline: 1px solid blue; 
    }
}
</style>