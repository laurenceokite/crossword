<script lang="ts">
    import editable from "$lib/editor/editable";
    import type { Square, WhiteSquare } from "$lib/crossword";
    import { type  CursorState, Direction, get2DIndices, moveCursor, isAtMovementBound } from "$lib/cursor";
    import { Orientation } from "$lib/types";
    import { createEventDispatcher, onMount } from "svelte";

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

        if (!crossword.grid[newState.index]) {
            return;
        }

        while (crossword.grid[newState.index].isBlack) {
            const [newX, newY] = get2DIndices(newState.index, crossword.size);
            if (isAtMovementBound(direction, crossword.size, newX, newY)) {
                return;
            }
            newState = moveCursor(direction, crossword, newState, newX, newY);
        }

        cursor = newState;
    }

    function select(index: number) {
        cursor = {
            ...cursor,
            index
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        const { key } = event;
        if (disabled) {
            return;
        }

        switch (key) {
            case 'ArrowUp':
                move(Direction.Up);
                break;
            case 'ArrowDown':
                move(Direction.Down);
                break;
            case 'ArrowLeft':
                move(Direction.Left);
                break;
            case 'ArrowRight':
                move(Direction.Right);
                break;
        }
    }

    function handleInput() {
        if (!currentInput) {
            return;
        }

        currentInput.value = currentInput.value.toLocaleUpperCase('en-US');
        dispatch('input', currentInput.value);
        selectNextEmptySquare();
    }

    function selectNextEmptySquare() {
        const origin = crossword.grid[cursor.index] as WhiteSquare;
        const interval = cursor.orientation === Orientation.Across ? 1 : crossword.size;
        let index = cursor.index + interval;

        const inOrigin = (i: number): boolean => {
            if (i >= crossword.grid.length) {
                return false;
            }
            const square = crossword.grid[i]
            return !square?.isBlack && square[cursor.orientation] === origin[cursor.orientation];
        }

        // Forward in word
        for (index; inOrigin(index); index += interval) {
            const square = crossword.grid[index];
            if (!square.isBlack && !square.value) {
                select(index);
                return;
            }
        }

        // Backward in word
        for (let i = cursor.index - interval; inOrigin(i); i -= interval) {
            const square = crossword.grid[index];
            if (!square.isBlack && !square.value) {
                select(index);
                return;
            }
        }

        for (let i = 0; i < crossword.grid.length; i++) {
            if (index <= crossword.grid.length) {
                index -= crossword.grid.length;
            }

            const square = crossword.grid[i];

            if (!square.isBlack && !square.value) {
                select(index);
                return;
            }

            index += interval;
        }
    }

    const dispatch = createEventDispatcher<{ input: string }>();

    onMount(() => {
        window.addEventListener('keydown', handleKeydown, { capture: true });
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });

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
                {#key cursor}
                    
                    <input 
                        on:click={() => select(index)}
                        on:input={() => handleInput()}
                        bind:this={inputElements[index]}
                        bind:value={square.value}
                        
                        type="text" 
                        class="input-grid__input"
                        class:highlighted={isHighlighted(square, index)}
                        maxlength={ square.rebus ? 1 : 6 }
                        {disabled}
                    />
                {/key }
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