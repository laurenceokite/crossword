<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import InputGridSquare from "./InputGridSquare.svelte";
    import editable from "../stores/editable";
    import cursor from "../stores/cursor";

    export let disabled: boolean;
    export let editor: boolean = false;

    const crossword = editor ? editable : editable;

    const dispatch = createEventDispatcher<{ input: string }>();

    function handleKeydown(event: KeyboardEvent) {
        const { key } = event;
        switch (key) {
            case 'ArrowUp': 
                
        }
    }

    onDestroy(() => {
        window.removeEventListener('keydown', handleKeydown);
    });

</script>

<div class="input-grid" style="--grid-size: {$crossword.size}">
    {#each $crossword.grid as square, index}
        {#key $cursor}
            <InputGridSquare 
                square={square.isBlack ? null : square}
                selected={index === $cursor.index}
                highlighted={false}
                {index}
                {disabled}
            /> 
        {/key}
    {/each}
</div>


<style lang="less">

.input-grid { 
    display: grid;
    grid-template-columns: repeat(var(--grid-size), 1fr);
    grid-template-rows: repeat(var(--grid-size), 1fr);
    aspect-ratio: 1;
    grid-gap: 2px;
    width: 100%;
    border: 3px solid var(--deep-grey);
    border-radius: 5px;
}

</style>