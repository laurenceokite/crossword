<script lang="ts">
    import InputGridSquare from "./InputGridSquare.svelte";
    import editable from "../stores/editable";
    import cursor, {
        backward,
        forward,
        getXIndex,
        getYIndex,
    } from "../stores/cursor";
    import { writable } from "svelte/store";
    import { createEventDispatcher } from "svelte";
    import ClueInput from "./ClueInput.svelte";
    import {
        Direction,
        EditMode,
        type Orientation,
        type Square,
        type WhiteSquare,
    } from "../types";

    export let focused: boolean = false;
    export let editor: boolean = false;
    export let editMode: EditMode = EditMode.Grid;

    const crossword = editor ? editable : editable;

    $: selectedSquare = $crossword.grid[$cursor.index];

    const current = writable<{
        orientation: Orientation;
        number: number | null;
    }>();

    let skipToNextEmptySquare = true;

    $: setCurrent(selectedSquare, $cursor.orientation);

    function setCurrent(square: Square | null, orientation: Orientation) {
        current.update((previous) => {
            const number = getCurrentNumber(square, orientation);

            if (
                previous.number === number &&
                orientation === previous.orientation
            ) {
                return previous;
            }

            skipToNextEmptySquare = true;

            return {
                orientation,
                number,
            };
        });
    }

    function getCurrentNumber(square: Square | null, orientation: Orientation) {
        if (!square || square.isBlack) {
            return null;
        }

        return square[orientation];
    }

    function handleKeydown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
            case "ArrowUp":
                event.preventDefault();
                skipToNextEmptySquare = false;
                cursor.move(
                    $crossword,
                    Direction.Up,
                    editMode === EditMode.Insert,
                );
                break;

            case "ArrowRight":
                event.preventDefault();
                skipToNextEmptySquare = false;
                cursor.move(
                    $crossword,
                    Direction.Right,
                    editMode === EditMode.Insert,
                );
                break;

            case "ArrowDown":
                event.preventDefault();
                skipToNextEmptySquare = false;
                cursor.move(
                    $crossword,
                    Direction.Down,
                    editMode === EditMode.Insert,
                );
                break;

            case "ArrowLeft":
                event.preventDefault();
                skipToNextEmptySquare = false;
                cursor.move(
                    $crossword,
                    Direction.Left,
                    editMode === EditMode.Insert,
                );
                break;

            case " ":
                if (editMode === EditMode.Grid) return;
                event.preventDefault();
                cursor.toggleOrientation();
        }
    }

    function handleClearValue(event: CustomEvent<number>) {
        dispatch("clearValue", event.detail);
        cursor.move($crossword, backward($cursor.orientation), true);
    }

    function handleUpdateValue(event: CustomEvent<[number, string]>) {
        dispatch("updateValue", event.detail);
        const number = $current.number;

        if (!number || !skipToNextEmptySquare) {
            cursor.move($crossword, forward($cursor.orientation), true);
        } else {
            cursor.goToNextEmptySquare($crossword);
        }
    }

    function handleSelectSquare(event: CustomEvent<number>) {
        cursor.setIndex($crossword.metadata.size, event.detail);
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
</script>

<div
    class="input-grid grid h-max w-screen @3xl:w-max aspect-square relative border-2 border-gray-950"
    style="--grid-size: {$crossword.size}"
    role="grid"
    tabindex="0"
    on:keydown={handleKeydown}
>
    {#each $crossword.grid as square, index}
        {#key $cursor}
            <InputGridSquare
                on:selectSquare={handleSelectSquare}
                on:updateValue={handleUpdateValue}
                on:clearValue={handleClearValue}
                square={square.isBlack ? null : square}
                selected={index === $cursor.index}
                highlighted={!square.isBlack && isHighlighted(square)}
                focusable={focused && editMode === EditMode.Insert}
                disabled={editMode === EditMode.Grid}
                ariaColindex={getXIndex($crossword.size, index)}
                ariaRowindex={getYIndex($crossword.size, index)}
            />
        {/key}
    {/each}
    <slot />
</div>

{#if $current.number}
    <ClueInput editor number={$current.number} />
{/if}

<style>
    .input-grid {
        grid-template-columns: repeat(var(--grid-size), minmax(auto, 3rem));
        grid-template-rows: repeat(var(--grid-size), minmax(auto, 3rem));
    }
</style>
