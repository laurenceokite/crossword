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

<div
    class="input-grid-square"
    class:highlighted
    class:selected
    class:black={square === null}
>
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
        />
    {/if}
</div>

<style lang="less">
    .input-grid-square {
        position: relative;
        outline: 1px solid grey;

        &.highlighted {
            &:not(.selected) {
                background-color: lightblue;
            }
        }

        &.selected {
            &::before {
                content: " ";
                position: absolute;
                inset: 0;
                opacity: 0.3;
                background-color: yellow;
            }
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

            &:focus {
                outline: none;
                caret-color: transparent;
            }
        }

        &__number {
            position: absolute;
            right: 10%;
            top: 5%;
            font-size: 0.8rem;
            z-index: 99;
        }
    }
</style>

