<script lang="ts">
    import InputGridSquare from "./InputGridSquare.svelte";
    import { editable } from "../stores/editable";
    import cursor, {
        backward,
        forward,
        getXIndex,
        getYIndex,
    } from "../stores/cursor";
    import { createEventDispatcher } from "svelte";
    import {
        Direction,
        type Crossword,
        type Square,
        type WhiteSquare,
    } from "../types";

    export let focused: boolean = false;
    export let disabled: boolean;
    export let editor: boolean;

    const { grid, clues, size } = editable;

    let selectedSquare: Square | null = null;
    $: selectedSquare = $grid.get($cursor.index) ?? null;

    const foci: (() => void)[] = [];
    $: length = $grid.size;
    $: if (foci.length > length) {
        foci.length = length;
    }
    $: focus($cursor.index);

    function focus(index: number) {
        if (disabled || !focused) {
            return;
        }

        foci[index]();
    }

    function getCrossword(): Crossword {
        return {
            grid: $grid,
            clues: $clues,
            size: $size,
        };
    }

    function handleKeydown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
            case "ArrowUp":
                event.preventDefault();
                cursor.move(getCrossword(), Direction.Up, true);
                break;

            case "ArrowRight":
                event.preventDefault();
                cursor.move(getCrossword(), Direction.Right, true);
                break;

            case "ArrowDown":
                event.preventDefault();
                cursor.move(getCrossword(), Direction.Down, true);
                break;

            case "ArrowLeft":
                event.preventDefault();
                cursor.move(getCrossword(), Direction.Left, true);
                break;

            case " ":
                if (disabled) return;
                event.preventDefault();
                cursor.toggleOrientation();
        }
    }

    function handleClearValue(event: CustomEvent<number>) {
        dispatch("clearValue", event.detail);
        cursor.move(getCrossword(), backward($cursor.orientation), true);
    }

    function handleUpdateValue(event: CustomEvent<[number, string]>) {
        dispatch("updateValue", event.detail);

        cursor.move(getCrossword(), forward($cursor.orientation), true);
    }

    function handleSelectSquare(event: CustomEvent<number>) {
        cursor.setIndex($size, event.detail);
    }

    function isHighlighted(square: WhiteSquare) {
        if (selectedSquare?.isBlack) {
            return false;
        }
        return (
            selectedSquare?.[$cursor.orientation] ===
            square[$cursor.orientation]
        );
    }

    const dispatch = createEventDispatcher<{
        updateValue: [index: number, value: string];
        clearValue: number;
    }>();
</script>

<div>
    <div
        class="input-grid grid h-max w-screen @3xl:w-max aspect-square relative border-2 border-gray-950"
        style="--grid-size: {$size}"
        role="grid"
        tabindex="0"
        on:keydown={handleKeydown}
    >
        {#each $grid as square, index}
            {#key $cursor}
                <InputGridSquare
                    on:selectSquare={handleSelectSquare}
                    on:updateValue={handleUpdateValue}
                    on:clearValue={handleClearValue}
                    square={square.isBlack ? null : square}
                    selected={index === $cursor.index}
                    highlighted={!square.isBlack && isHighlighted(square)}
                    focusable={focused && !disabled}
                    {disabled}
                    ariaColindex={getXIndex($size, index)}
                    ariaRowindex={getYIndex($size, index)}
                    bind:focus={foci[index]}
                />
            {/key}
        {/each}
        <slot />
    </div>

    {#if selectedSquare && !selectedSquare.isBlack && !disabled}
        <ClueInput
            {editor}
            number={selectedSquare[$cursor.orientation]}
            orientation={$cursor.orientation}
        />
    {:else}
        <div class="h-24 bg-gray-200"></div>
    {/if}
</div>

<style>
    .input-grid {
        grid-template-columns: repeat(var(--grid-size), minmax(auto, 3rem));
        grid-template-rows: repeat(var(--grid-size), minmax(auto, 3rem));
    }
</style>
