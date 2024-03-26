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
        select: number
    }>();

    $: if (!disabled && selected && inputElement) {
        inputElement.focus();
    }
</script>


<div
    class="input-grid-square__container"
    class:highlighted={highlighted}
    class:is-black={!square}
> 
    {#if square}
            <div class="input-grid-square__number">
                { square.number }
            </div>                    
            <input
                on:click={() => dispatch("select", index)}
                bind:value={square.value}
                bind:this={inputElement}
                data-index={index}
                type="text" 
                class="input-grid__input"                         
                maxlength="6"
                {disabled}
            />
    {/if}
</div>

<style lang="less">
.input-grid-square {
    &__container {
        position: relative;
        max-width: 5rem;
        min-width: var(--min-sq-size);
        outline: 1px solid var(--deep-grey);
    }

    & .highlighted {
        background-color: var(--light-blue); 
    }

    & .is-black {
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
            background-color: var(--light-yellow);
            outline: none;
            caret-color: transparent;
        }
    }

    &__number {
        position: absolute;
        right: 10%;
        top: 5%;
        font-size: .8rem;
    }
}
</style>