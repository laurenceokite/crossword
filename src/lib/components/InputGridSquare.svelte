<script lang="ts">
    import type { WhiteSquare } from "../crossword";
    import { createEventDispatcher } from "svelte";

    export let square: WhiteSquare | null;
    export let index: number;
    export let highlighted: boolean;
    export let disabled: boolean;
    export let selected: boolean;

    let inputElement: HTMLInputElement | null = null;

    const dispatch = createEventDispatcher<{
        selectSquare: number;
        updateValue: [index: number, value: string];
        clearValue: number;
    }>();

    $: if (disabled && selected && inputElement) {
        inputElement.blur();
    }

    $: if (!disabled && selected && inputElement) {
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

<div class="input-grid-square" class:highlighted class:black={square === null}>
    {#if square}
        {#if square.number}
            <div class="input-grid-square__number">
                {square.number}
            </div>
        {/if}
        <input
            on:click={() => dispatch("selectSquare", index)}
            on:input={handleInput}
            on:keydown={handleKeydown}
            value={square.value}
            bind:this={inputElement}
            data-index={index}
            type="text"
            class="input-grid-square__input"
            maxlength="6"
            {disabled}
            class:selected
        />
    {/if}
</div>

<style lang="less">
    .input-grid-square {
        position: relative;
        max-width: 5rem;
        min-width: var(--min-sq-size);
        outline: 1px solid grey;

        &.highlighted {
            background-color: lightblue;
        }

        &.black {
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

            &.selected {
                background-color: yellow;
                outline: none;
                caret-color: transparent;
            }
        }

        &__number {
            position: absolute;
            right: 10%;
            top: 5%;
            font-size: 0.8rem;
        }
    }
</style>

