<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import cursor from "../stores/cursor";
    import editable from "../stores/editable";
    import InputGridSquare from "./InputGridSquare.svelte";
    import type { Orientation } from "../types";

    export let number: number;
    export let orientation: Orientation;
    export let editor = false;
    export let focusable = false;

    const dispatch = createEventDispatcher<{
        updateValue: [number, string];
        clearValue: number;
    }>();

    const crossword = editable;
    let squareInputMode = false;
    let indices: number[];

    $: currentNumber = $crossword.grid[$cursor.index][$cursor.orientation];

    $: if (number !== currentNumber && squareInputMode) {
        squareInputMode = false;
    }

    $: indices = $crossword[orientation][number]?.squares ?? [];
    $: clue = $crossword[orientation][number] ?? null;

    function handleUpdateValue(event: CustomEvent<[number, string]>) {
        dispatch("updateValue", event.detail);

        const index = indices.findIndex((i) => i === $cursor.index);

        if (index >= indices.length - 1) return;

        cursor.setIndex($crossword.size, indices[index + 1]);
    }

    function handleClearValue(event: CustomEvent<number>) {
        dispatch("clearValue", event.detail);

        const index = indices.findIndex((i) => i === $cursor.index);

        if (index < 1) return;

        cursor.setIndex($crossword.size, indices[index - 1]);
    }

    function handleSelectSquare(event: CustomEvent<number>) {
        if (event.detail === $cursor.index) return;

        cursor.setIndex($crossword.size, event.detail);
    }
</script>

{#if clue}
    <div
        class="border p-2"
        class:bg-blue-100={number === currentNumber && focusable}
        class:bg-blue-50={number === currentNumber && !focusable}
    >
        <div class="font-semibold">{number}</div>
        {#if editor}
            <textarea
                class="my-4 h-8 w-full border border-black"
                value={clue.text}
                on:focus={() => {
                    squareInputMode = false;
                }}
            ></textarea>
        {:else}
            <div>{clue.text}</div>
        {/if}
        <div
            role="grid"
            class="flex border border-black w-fit bg-white"
            on:focusin={() => {
                squareInputMode = true;
            }}
        >
            {#each indices.map((i) => $crossword.grid[i]) as square, colindex}
                {#if square && !square.isBlack}
                    <div class="w-8">
                        <InputGridSquare
                            {square}
                            highlighted={false}
                            focusable={focusable && squareInputMode}
                            disabled={false}
                            selected={square.index === $cursor.index}
                            ariaRowindex={undefined}
                            ariaColindex={colindex}
                            displayNumber={false}
                            on:updateValue={handleUpdateValue}
                            on:selectSquare={handleSelectSquare}
                            on:clearValue={handleClearValue}
                        />
                    </div>
                {/if}
            {/each}
        </div>
    </div>
{/if}
