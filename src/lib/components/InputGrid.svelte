<script lang="ts">
    import InputGridSquare from "./InputGridSquare.svelte";
    import editable from "../stores/editable";
    import cursor, { backward, forward } from "../stores/cursor";
    import type { WhiteSquare, Square } from "../crossword";
    import { Direction, Orientation } from "../cursor";
    import { writable } from "svelte/store";
    import { createEventDispatcher, onMount } from "svelte";

    export let disabled: boolean;
    export let editor: boolean = false;

    const crossword = editor ? editable : editable;
    const answerStore = crossword.answerStore;

    $: selectedSquare = $crossword.grid[$cursor.index];

    let currentNumber = writable(
        selectedSquare && !selectedSquare.isBlack
            ? selectedSquare[$cursor.orientation]
            : null,
    );
    let skipToNextEmptySquare = true;

    $: setCurrentNumber(selectedSquare, $cursor.orientation);

    function setCurrentNumber(square: Square | null, orientation: Orientation) {
        currentNumber.update((previousValue) => {
            if (!square || square.isBlack) {
                return null;
            }

            const newValue = square[orientation];

            if (previousValue !== newValue) {
                skipToNextEmptySquare = true;
            }

            return newValue;
        });
    }

    function handleKeydown(event: KeyboardEvent) {
        if (disabled) {
            return;
        }

        const { key } = event;

        switch (key) {
            case "ArrowUp":
                event.preventDefault();
                skipToNextEmptySquare = false;
                cursor.move($crossword, Direction.Up, true);
                break;

            case "ArrowRight":
                event.preventDefault();
                skipToNextEmptySquare = false;
                cursor.move($crossword, Direction.Right, true);
                break;

            case "ArrowDown":
                event.preventDefault();
                skipToNextEmptySquare = false;
                cursor.move($crossword, Direction.Down, true);
                break;

            case "ArrowLeft":
                event.preventDefault();
                skipToNextEmptySquare = false;
                cursor.move($crossword, Direction.Left, true);
                break;
        }
    }

    function handleClearValue(event: CustomEvent<number>) {
        dispatch("clearValue", event.detail);
        cursor.move($crossword, backward($cursor.orientation), true);
    }

    function handleUpdateValue(event: CustomEvent<[number, string]>) {
        dispatch("updateValue", event.detail);
        const number = $currentNumber;

        if (
            !number ||
            !skipToNextEmptySquare ||
            $answerStore.completion.isComplete
        ) {
            cursor.move($crossword, forward($cursor.orientation), true);
        } else {
            cursor.goToNextEmptySquare($answerStore, number);
        }
    }

    function handleSelectSquare(event: CustomEvent<number>) {
        cursor.setIndex($crossword.size, event.detail);
    }

    function isHighlighted(square: WhiteSquare) {
        if (selectedSquare.isBlack) {
            return false;
        }
        return (
            selectedSquare[$cursor.orientation] === square[$cursor.orientation]
        );
    }

    const dispatch = createEventDispatcher<{
        updateValue: [index: number, value: string];
        clearValue: number;
    }>();

    onMount(() => {
        window.addEventListener("keydown", handleKeydown);
        return () => window.removeEventListener("keydown", handleKeydown);
    });
</script>

<div class="input-grid" style="--grid-size: {$crossword.size}" role="group">
    {#each $crossword.grid as square, index}
        {#key $cursor}
            <InputGridSquare
                on:selectSquare={handleSelectSquare}
                on:updateValue={handleUpdateValue}
                on:clearValue={handleClearValue}
                square={square.isBlack ? null : square}
                selected={index === $cursor.index}
                highlighted={!square.isBlack && isHighlighted(square)}
                {disabled}
                {index}
            />
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
    }
</style>
