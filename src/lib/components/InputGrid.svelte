<script lang="ts">
    import editable from "$lib/editor/editable";
    import type { Square, WhiteSquare } from "$lib/crossword";
    import { type  CursorState, Direction, Orientation, get2DIndices, moveCursor, isAtMovementBound, forward, getInterval } from "$lib/cursor";
    import { createEventDispatcher, onMount } from "svelte";

    export let editing = true;
    export let disabled = false;
    export let cursor: CursorState = {
        orientation: Orientation.Across,
        index: 0
    };

    const crossword = editing ? $editable : $editable;
    let inputElements: HTMLInputElement[] = [];
    let currentWord: [number, WhiteSquare][] = [];
    let currentWordIsFull: boolean = false;
    let isAmendingWord: boolean = false;
    let wordIndex: number | null;
    let currentNumber: number;
    let previousNumber: number;
    let previousOrientation = cursor.orientation;
    
    $: currentSquare = crossword.grid[cursor.index] ?? null;
    $: currentInput = inputElements[cursor.index] ?? null;

    $: {
        if (
            currentSquare 
            && !currentSquare.isBlack
            && currentSquare[cursor.orientation] !== currentNumber
        ) {
            previousNumber = currentNumber;
            currentNumber = currentSquare[cursor.orientation];
            isAmendingWord = false;
        }
    };

    $: {
        if (
            previousOrientation !== cursor.orientation || 
            previousNumber !== currentNumber && 
            !currentSquare.isBlack
        ) {
            previousOrientation = cursor.orientation;
            currentWord = mapCurrentSet();
            currentWordIsFull = currentWord.every(t => t[1].value !== "");
        }
    }

    $: wordIndex = currentWord.findIndex(item => item[0] === cursor.index);

    $: {
        if (!disabled && currentInput) {
            currentInput.focus();
            currentInput.selectionStart = currentInput.value.length;
            currentInput.selectionEnd = currentInput.value.length;
        }
    }

    $: {
        if (disabled && currentInput) {
            currentInput.blur();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        const { key } = event;
        if (disabled) {
            return;
        }

        switch (key) {   
            case 'ArrowUp':
                event.preventDefault();
                move(Direction.Up);
                break;
            case 'ArrowDown':
                event.preventDefault();
                move(Direction.Down);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                move(Direction.Left);
                break;
            case 'ArrowRight':
                event.preventDefault();
                move(Direction.Right);
                break;
        }
    }

    function handleInput() {
        if (!currentInput) {
            return;
        }

        const isFull = currentWordIsFull;

        // Allow copy paste to be automatically handled as rebus
        if (currentInput.value.length === 2) {
            currentInput.value = currentInput.value.slice(1);
        }
        currentInput.value = currentInput.value.toLocaleUpperCase('en-US');
        dispatch('input', currentInput.value);

        if (isFull || isAmendingWord) {
            move(forward(cursor.orientation));
            return;
        }

        if (currentWord.length && wordIndex != null) {
            let index = wordIndex + 1;

            for (let i = 0; i < currentWord.length - 1; i++) {

                if (index >= currentWord.length) {
                    index = 0;
                }

                if (currentWord[index] && !currentWord[index][1].value) {
                    select(currentWord[index][0]);
                    return;
                }

                index++
            }
        }

        const interval = getInterval(cursor.orientation, crossword.size);
        let index = currentWord[currentWord.length - 1][0] + interval;
        
        for (let i = 0; i < crossword.grid.length; i++) {
            if (index >= crossword.grid.length) {
                index -= crossword.grid.length;
            }

            const square = crossword.grid[index] ?? null;

            if (square && !square.isBlack && !square.value) {
                select(index);
                return;
            }

            index += interval;
        }
    }

    function handleBackspace(event: KeyboardEvent) {
        const { key } = event;

        if (key !== "Backspace") {
            return;
        }

        if (!currentInput) {
            return;
        }

        event.preventDefault();
        currentInput.value = '';
        dispatch('input', currentInput.value);

        move(cursor.orientation === Orientation.Across ? Direction.Left : Direction.Up)
    }

    function handleSpace(event: KeyboardEvent) {
        if (event.key === " ") {
            event.preventDefault();
            toggleOrientation();
        }
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

        isAmendingWord = previousNumber === currentNumber;
    }

    function select(index: number) {
        cursor = {
            ...cursor,
            index
        }
    }

    function toggleOrientation() {
        cursor = {
            ...cursor,
            orientation: cursor.orientation === Orientation.Across ? Orientation.Down : Orientation.Across
        }
    }

    function mapCurrentSet(): [number, WhiteSquare][] {
        if (currentSquare.isBlack) {
            return [];
        }

        let set: [number, WhiteSquare][] = [];
        
        const [x, y] = get2DIndices(cursor.index, crossword.size);
        let index = y * crossword.size + x;

        const interval = cursor.orientation === Orientation.Across ? 1 : crossword.size
        
        for (let i = index; i >= 0; i -= interval) {
            const square = crossword.grid[i];

            if (
                !square 
                || square.isBlack 
                || square[cursor.orientation] !== currentSquare[cursor.orientation]
            ) break;

            set.unshift([i, square]);
        }
        
        for (let i = index + 1; i < crossword.grid.length; i += interval) {
            const square = crossword.grid[i];

            if (
                !square 
                || square.isBlack 
                || square[cursor.orientation] !== currentSquare[cursor.orientation]
            ) break;

            set.push([i, square]);
        }

        return set;
    }

    function isHighlighted(square: Square, index: number): boolean {
        if (
            cursor.index === index 
            || square.isBlack
            || !currentSquare
            || currentSquare.isBlack
        ) {
            return false;
        }

        if (currentSquare?.[cursor.orientation] === square[cursor.orientation]) {
            return true;
        }

        return false;
    }

    function isBlack(index: number) {
        return crossword.grid[index].isBlack
    }

    const dispatch = createEventDispatcher<{ input: string }>();

    onMount(() => {
        window.addEventListener('keydown', handleKeydown, { capture: true });
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });

</script>

<div class="input-grid">
    {#each crossword.grid as square, index}
        {#key [cursor, crossword]}
            <div
                class="input-grid__square-container"
                class:highlighted={isHighlighted(square, index)}
                class:is-black={isBlack(index)}
            > 
                {#if !square.isBlack}
                    {#if !disabled && square.number }
                        <div class="input-grid__number">
                            { square.number }
                        </div>
                    {/if}                       
                        <input 
                            on:click={() => select(index)}
                            on:input={() => handleInput()}
                            on:keydown={handleBackspace}
                            on:keydown={handleSpace}
                            bind:this={inputElements[index]}
                            bind:value={square.value}
                            type="text" 
                            class="input-grid__input"                         
                            maxlength="6"
                            {disabled}
                        />
                {/if}
            </div> 
        {/key}
    {/each}
</div>


<style lang="less">

.input-grid { 
    display: grid;
    grid-template-columns: repeat(var(--grid-size), 1fr);
    grid-template-rows: repeat(var(--grid-size), 1fr);
    aspect-ratio: 1;
    grid-gap: 2px;
    width: 100%;
    border: 3px solid var(--deep-grey);
    border-radius: 5px;

    &__square-container {
        position: relative;
        max-width: 5rem;
        min-width: var(--min-sq-size);
        outline: 1px solid var(--deep-grey);
    }

    & .highlighted {
        background-color: var(--light-blue); 
    }

    & .is-black {
        background-color: black;
    }

    &__input {        
        background-color: transparent;
        text-align: center;
        font-size: 1.25rem;
        font-weight: 500;
        width: 100%;
        height: 100%;
        border: none;

        &:focus {
            background-color: var(--light-yellow);
            outline: none;
            caret-color: transparent;
        }
    }

    &__number {
        position: absolute;
        right: 10%;
        top: 5%;
        font-size: .8rem;
    }
}
</style>