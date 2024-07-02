<script lang="ts">
    import InputGridSquare from "./InputGridSquare.svelte";
    import { editable } from "../stores/editable";
    import {
        cursor,
        backward,
        forward,
        getXIndex,
        getYIndex,
    } from "../stores/cursor";
    import { createEventDispatcher } from "svelte";
    import { Direction, type Square } from "../types";

    export let focused: boolean = false;
    export let disabled: boolean;

    const { grid, size, clues } = editable;

    let goToNextEmpty = true;

    let selectedSquare: Square | null = null;
    $: selectedSquare = $grid[$cursor.index] ?? null;

    function move(direction: Direction) {
        if ($cursor.number === $cursor.previousNumber) {
            goToNextEmpty = false;
        }
        cursor.move(editable.crossword(), direction, true);
    }

    function handleKeydown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
            case "ArrowUp":
                move(Direction.Up);
                break;

            case "ArrowRight":
                event.preventDefault();
                move(Direction.Right);
                break;

            case "ArrowDown":
                event.preventDefault();
                move(Direction.Down);
                break;

            case "ArrowLeft":
                event.preventDefault();
                move(Direction.Left);
                break;

            case " ":
                if (disabled) return;
                event.preventDefault();
                cursor.toggleOrientation();
        }
    }

    function handleClearValue(event: CustomEvent<number>) {
        dispatch("clearValue", event.detail);
        cursor.move(editable.crossword(), backward($cursor.orientation), true);
    }

    function handleUpdateValue(event: CustomEvent<[number, string]>) {
        dispatch("updateValue", event.detail);
        if (goToNextEmpty) {
            const { number } = $cursor;
            cursor.goToNextEmptySquare(
                editable.crossword(),
                number !== null
                    ? new Set($clues[$cursor.orientation].get(number)?.indices)
                    : undefined,
            );
        } else {
            cursor.move(
                editable.crossword(),
                forward($cursor.orientation),
                true,
            );
        }
    }

    function handleSelectSquare(event: CustomEvent<number>) {
        cursor.setIndex(editable.crossword(), event.detail);
    }

    const dispatch = createEventDispatcher<{
        updateValue: [index: number, value: string];
        clearValue: number;
    }>();
</script>

<div
    class="input-grid grid h-max w-screen @3xl:w-max aspect-square relative border-2 border-gray-950"
    style="--grid-size: {$size}"
    role="grid"
    tabindex="0"
    on:keydown={handleKeydown}
>
    {#each $grid as square, index (square)}
        <InputGridSquare
            on:selectSquare={handleSelectSquare}
            on:updateValue={handleUpdateValue}
            on:clearValue={handleClearValue}
            square={square.isBlack ? null : square}
            focusable={focused && !disabled}
            selected={$cursor.index === index}
            highlighted={$cursor.number === square[$cursor.orientation]}
            {disabled}
            ariaColindex={getXIndex($size, index)}
            ariaRowindex={getYIndex($size, index)}
        />
    {/each}
    <slot />
</div>

<style>
    .input-grid {
        grid-template-columns: repeat(var(--grid-size), minmax(auto, 3rem));
        grid-template-rows: repeat(var(--grid-size), minmax(auto, 3rem));
    }
</style>
