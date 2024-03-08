<script lang="ts">
    import editable from "$lib/editor/editable";
    import type { Square, WhiteSquare } from "$lib/crossword";
    import { type  CursorState, Direction, get2DIndices, moveCursor, isAtMovementBound } from "$lib/cursor";
    import { Orientation } from "$lib/types";

    export let editing = true;
    export let disabled = false;
    export let cursor: CursorState = {
        orientation: Orientation.Across,
        index: 0
    };

    const crossword = editing ? $editable : $editable;
    let inputElements: HTMLInputElement[] = [];

    $: currentSquare = crossword.grid[cursor.index] ?? null;
    $: currentInput = inputElements[cursor.index] ?? null;

    $: {
        if (!disabled && currentInput) {
            currentInput.focus();
        }
    }

    $: {
        if (disabled && currentInput === document.activeElement) {
            currentInput.blur();
        }
    }

    function isHighlighted(square: Square, index: number): boolean {
        if (
            cursor.index === index 
            || square.isBlack
            || currentSquare.isBlack
        ) {
            return false;
        }

        if (currentSquare?.[cursor.orientation] === square[cursor.orientation]) {
            return true;
        }

        return false;
    } 

    function move(direction: Direction) {
        const [x, y] = get2DIndices(cursor.index, crossword.size)
        let newState = moveCursor(direction, crossword, cursor, x, y);

        while (crossword.grid[newState.index]?.isBlack) {
            const [newX, newY] = get2DIndices(newState.index, crossword.size);
            if (isAtMovementBound(direction, crossword.size, newX, newY)) {
                return;
            }
            newState = moveCursor(direction, crossword, newState, newX, newY);
        }

        cursor = newState;
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
                    bind:this={inputElements[index]}
                    type="text" 
                    class="input-grid__input"
                    class:highlighted={isHighlighted(square, index)}
                    value={square.value}
                    maxlength={ square.rebus ? 1 : 6 }
                    {disabled}
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

    & .highlighted {
        background-color: #56789a; 
    }

    &__input {
        background-color: transparent;
    }
}
</style>