<script lang="ts">
    import { onMount } from "svelte";
    import { toggleSquare } from "../editor/commands/toggle-square";
    import crossword from "../stores/editable";

    function handleKeydown(event: KeyboardEvent) {

    }

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
        }
    });
</script>


<div class="grid-designer" style="--grid-size: {$crossword.size}">
    {#each $crossword.grid as square, index}
        <input 
            class="grid-designer__input"
            type="checkbox" 
            value={square.isBlack}
            on:change={() => crossword.execute(toggleSquare(index))}
        /> 
    {/each}
</div>

<style lang="less">
    .grid-designer {
        opacity: .5;
        position: absolute;
        inset: 0;
        display: grid;
        grid-template-columns: repeat(var(--grid-size), 1fr);
        grid-template-rows: repeat(var(--grid-size), 1fr);
        aspect-ratio: 1;

        &__input {
            width: 100%;
            height: 100%;
        }
    }
</style>