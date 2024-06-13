<script lang="ts">
    import type { WhiteSquare } from "../types";
    import { createEventDispatcher } from "svelte";

    export let square: WhiteSquare | null;
    export let ariaColindex: number | undefined;
    export let ariaRowindex: number | undefined;
    export let highlighted: boolean;
    export let focusable: boolean;
    export let disabled: boolean;
    export let selected: boolean;
    export let displayNumber = true;

    export let inputElement: HTMLInputElement | null = null;
    let hasFocus = false;

    const dispatch = createEventDispatcher<{
        selectSquare: number;
        updateValue: [index: number, value: string];
        clearValue: number;
    }>();

    $: if (focusable && selected && inputElement && !hasFocus) {
        inputElement.focus();
    }

    function handleInput(event: Event) {
        if (!square) return;

        const el = event.target as HTMLInputElement;

        el.value = el.value.trim();

        if (el.value.length > 1) {
            el.value = el.value.split("").pop() ?? el.value;
        }

        el.value = el.value.toLocaleUpperCase();

        dispatch("updateValue", [square.index, el.value]);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (!square) return;
        switch (event.key) {
            case "Backspace":
                event.preventDefault();
                dispatch("clearValue", square.index);
                break;
        }
    }

    function handleClick() {
        if (!square) return;
        dispatch("selectSquare", square.index);
    }
</script>

<div
    class:bg-blue-100={highlighted && !disabled}
    class:bg-blue-200={selected && !focusable}
    class:bg-yellow-100={selected && focusable}
    class:bg-gray-950={square === null}
    class:bg-gray-600={selected && disabled && square === null}
    class="relative border border-1 border-gray-500 aspect-square"
    role="gridcell"
    aria-colindex={ariaColindex}
    aria-rowindex={ariaRowindex}
>
    {#key focusable}
        {#if square !== null}
            {#if square.number && displayNumber}
                <div class="absolute top-0 left-0 text-tiny pl-[2px]">
                    {square.number}
                </div>
            {/if}
            <input
                on:click={() => handleClick()}
                on:input={handleInput}
                on:keydown={handleKeydown}
                on:keydown
                value={square.value}
                bind:this={inputElement}
                type="text"
                maxlength="6"
                class="bg-transparent caret-transparent text-center font-semibold w-full h-full focus:ring-2 ring-inset"
                {disabled}
                tabindex="-1"
            />
        {/if}
    {/key}
</div>
