<script lang="ts">
    import type { Clue, WhiteSquare } from "../crossword";
    import type { CursorState } from "../cursor";
    import InputGridSquare from "./InputGridSquare.svelte";

    export let clue: Clue;
    export let number: number;
    export let currentNumber: number | null;
    export let cursor: CursorState;
    export let squares: WhiteSquare[];
    export let editor = false;
    export let focused = false;
    let squareInputMode = false;

    $: if (number !== currentNumber && squareInputMode) {
        squareInputMode = false;
    }
</script>

<div class="border p-2">
    <div class="font-semibold">{number}</div>
    {#if editor}
        <input
            type="text"
            value={clue.text}
            on:focus={() => {
                squareInputMode = false;
            }}
        />
    {:else}
        <div>{clue.text}</div>
    {/if}
    <ul
        class="flex border border-black w-fit"
        on:focusin={() => {
            squareInputMode = true;
        }}
    >
        {#each squares as square}
            <li class="w-8">
                <InputGridSquare
                    {square}
                    highlighted={false}
                    focusable={focused && squareInputMode}
                    disabled={false}
                    selected={square.index === cursor.index}
                    displayNumber={false}
                    on:updateValue
                    on:selectSquare
                />
            </li>
        {/each}
    </ul>
</div>
