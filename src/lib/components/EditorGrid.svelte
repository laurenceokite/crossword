
<script lang="ts">
    import editable from "$lib/editor/editable";
    import { EditMode, Orientation } from "$lib/editor/types";
    import { WhiteSquare, type Square } from "$lib/square";

    const crossword = $editable;

    $: selectedSquare = crossword.grid[crossword.cursor.index];

    let cursorOrientation: keyof WhiteSquare;
    $: cursorOrientation = crossword.cursor.orientation === Orientation.Across ? 'across' : 'down';

    function handleClick(event: Event) {
        if (crossword.mode === EditMode.Insert) {
            return;
        }
    }

    function squareIsHighlighted(square: Square, index: number) {
        const { cursor } = crossword;

        if (cursor.index == index) {
            return true;
        }

        if (square.isBlack || selectedSquare.isBlack) {
            return false;
        }

        if (square[cursorOrientation] === selectedSquare.number) {
            return true;
        }

        return false;
    } 
</script>

<div class="editor-grid" style={`--grid-size: ${crossword.size}`}>
    {#each crossword.grid as square, index}
        <div
            class="editor-grid__square-container"
            class:highlight={squareIsHighlighted(square, index)}
        > 
            {#if !square.isBlack}
                {#if square.number}
                    <div class="editor-grid__number">
                        { square.number }
                    </div>
                {/if}
                <input 
                    type="text" 
                    class="editor-grid__square"
                    value={square.value} 
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

    & .highlight {
        outline: 1px solid blue; 
    }
}

</style>