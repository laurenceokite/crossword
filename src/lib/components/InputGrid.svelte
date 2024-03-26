<script lang="ts">
    import { onMount } from "svelte";
    import InputGridSquare from "./InputGridSquare.svelte";
    import editable from "../stores/editable";
    import cursor, { backward } from "../stores/cursor";
    import type { WhiteSquare, Square } from "../crossword";
    import { Direction } from "../cursor";
    import type { WordMap } from "../stores/types";
    import { writable, type Writable } from "svelte/store";

    export let disabled: boolean;
    export let editor: boolean = false;

    const crossword = editor ? editable : editable;
    const wordStore = crossword.wordStore;
    const selectedSquare: Writable<Square> = writable();
    let previousSquare: Square;

    $: updateSelectedSquare($crossword.grid[$cursor.index]);

    $: currentNumber = !$selectedSquare.isBlack
        ? $selectedSquare[$cursor.orientation]
        : null;

    $: currentWord = getCurrentWord(
        $wordStore[$cursor.orientation],
        currentNumber,
    );

    function getCurrentWord(
        wordMap: WordMap,
        number: number | null,
    ): WhiteSquare[] | null {
        if (!number) {
            return null;
        }
        return wordMap.get(number) ?? null;
    }

    function updateSelectedSquare(newValue: Square) {
        selectedSquare.update((previousValue) => {
            if (previousSquare != previousValue) {
                previousSquare = previousValue;
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
                cursor.move($crossword, Direction.Up, true);
            case "ArrowRight":
                event.preventDefault();
                cursor.move($crossword, Direction.Right, true);
            case "ArrowDown":
                event.preventDefault();
                cursor.move($crossword, Direction.Down, true);
            case "ArrowLeft":
                event.preventDefault();
                cursor.move($crossword, Direction.Left, true);
            case "Backspace":
                // Allow it to bubble
                cursor.move($crossword, backward($cursor.orientation), true);
        }
    }

    function handleInput() {
        if (!previousSquare.isBlack) {
        }
    }

    function goToNextEmptySquare() {
        if (currentWord && !currentWord.every((s) => s.value)) {
        }
    }

    function isHighlighted(square: WhiteSquare) {
        if ($selectedSquare.isBlack) {
            return false;
        }
        return (
            $selectedSquare[$cursor.orientation] === square[$cursor.orientation]
        );
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeydown);

        return () => {
            window.removeEventListener("keydown", handleKeydown);
        };
    });
</script>

<div class="input-grid" style="--grid-size: {$crossword.size}" role="group">
    {#each $crossword.grid as square, index}
        {#key $cursor}
            <InputGridSquare
                on:input={handleInput}
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
