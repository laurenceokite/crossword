<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import crossword from "../stores/editable";
    import cursor from "../stores/cursor";
    import { Direction } from "../cursor";

    const dispatch = createEventDispatcher<{
        toggleSquare: number;
    }>();

    let inputElements: HTMLInputElement[] = [];

    $: if (inputElements.length && inputElements.length > $cursor.index) {
        inputElements[$cursor.index].focus();
    }

    function handleKeydown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
            case "ArrowUp":
                event.preventDefault();
                cursor.move($crossword, Direction.Up);
                break;

            case "ArrowRight":
                event.preventDefault();
                cursor.move($crossword, Direction.Right);
                break;

            case "ArrowDown":
                event.preventDefault();
                cursor.move($crossword, Direction.Down);
                break;

            case "ArrowLeft":
                event.preventDefault();
                cursor.move($crossword, Direction.Left);
                break;
        }
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeydown);

        return () => {
            window.removeEventListener("keydown", handleKeydown);
        };
    });
</script>

<div class="grid-designer" style="--grid-size: {$crossword.size}">
    {#each $crossword.grid as square, index}
        <input
            class="grid-designer__input"
            type="checkbox"
            value={square.isBlack}
            on:change={() => dispatch("toggleSquare", index)}
            bind:this={inputElements[index]}
        />
    {/each}
</div>

<style lang="less">
    .grid-designer {
        opacity: 0.5;
        position: absolute;
        inset: 0;
        display: grid;
        grid-template-columns: repeat(var(--grid-size), 1fr);
        grid-template-rows: repeat(var(--grid-size), 1fr);
        aspect-ratio: 1;

        &__input {
            width: 100%;
            height: 100%;

            &:focus {
                outline: green;
            }
        }
    }
</style>

