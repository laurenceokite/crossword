<script lang="ts">
    import type { WhiteSquare } from "../crossword";
    import { createEventDispatcher } from "svelte";

    export let square: WhiteSquare | null;
    export let index: number;
    export let highlighted: boolean;
    export let focusable: boolean;
    export let disabled: boolean;
    export let selected: boolean;

    let inputElement: HTMLInputElement | null = null;

    const dispatch = createEventDispatcher<{
        selectSquare: number;
        updateValue: [index: number, value: string];
        clearValue: number;
    }>();

    $: if (focusable && selected && inputElement) {
        inputElement.focus();
    }

    function handleInput(event: Event) {
        const el = event.target as HTMLInputElement;

        el.value = el.value.trim();

        if (el.value.length > 1) {
            el.value = el.value.split("").pop() ?? el.value;
        }

        el.value = el.value.toLocaleUpperCase();

        dispatch("updateValue", [index, el.value]);
    }

    function handleKeydown(event: KeyboardEvent) {
        switch (event.key) {
            case "Backspace":
                event.preventDefault();
                dispatch("clearValue", index);
                break;
        }
    }
</script>

<div
    class="relative border border-1 border-gray-500"
    class:bg-blue-100={highlighted && !disabled}
    class:bg-yellow-200={selected && !disabled}
    class:bg-blue-200={selected && disabled && square}
    class:bg-gray-950={square === null}
    class:bg-gray-600={selected && disabled && square === null}
>
    {#key focusable}
        {#if square !== null}
            {#if square.number}
                <div class="absolute top-0 left-1 text-xs leading-tight">
                    {square.number}
                </div>
            {/if}
            <input
                on:click={() => dispatch("selectSquare", index)}
                on:input={handleInput}
                on:keydown={handleKeydown}
                value={square.value}
                bind:this={inputElement}
                type="text"
                maxlength="6"
                class="bg-transparent text-center font-semibold w-full h-full focus:ring-2 ring-inset"
                {disabled}
            />
        {/if}
    {/key}
</div>
