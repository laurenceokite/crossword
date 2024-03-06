<script lang="ts">
    import type { Crossword } from "$lib/crossword";
    import type { EditorCommandType } from "$lib/editor/types";
    import { createEventDispatcher } from "svelte";

    export let crossword: Crossword;
    const dispatch = createEventDispatcher<{
        edit: EditorCommandType;
    }>();

</script>

<div class="editor-grid" style={`--grid-size: ${crossword.size}`}>
    {#each crossword.grid as square, index}
        <div
            class="editor-grid__square-container" 
        > 
            {#if !square.isBlack}
                {#if square.number}
                    <div>
                        { square.number }
                    </div>
                {/if}
                <input 
                    type="text" 
                    class="editor-grid__square"
                    value={square.value} 
                    data-index={index}
                    data-number={square.number}
                    data-across={square.across}
                    data-down={square.across}
                />
            {/if}
        </div> 
    {/each}
</div>


<style>
.editor-grid { 
    display: grid;
    grid-template-columns: repeat(var(--grid-size), 1fr);
    grid-template-rows: repeat(var(--grid-size), 1fr);

    &__square-container {
        aspect-ratio: 1;
    }
}

</style>