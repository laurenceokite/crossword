<script lang="ts">
    import type { WhiteSquare } from "$lib/crossword";
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

    $: if (selected && inputElement) {
        inputElement.focus();
    }
</script>


<div
    class="input-grid-square__container"
    class:highlighted={highlighted}
    class:is-black={!square}
> 
    {#if square}
        {#if !disabled && square.number }
            <div class="input-grid-square__number">
                { square.number }
            </div>
        {/if}                       
            <input
                on:click={() => dispatch("select", index)}
                bind:value={square.value}
                bind:this={inputElement}
                type="text" 
                class="input-grid__input"                         
                maxlength="6"
                {disabled}
            />
    {/if}
</div>