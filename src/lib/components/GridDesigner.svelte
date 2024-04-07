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

    function handleChange(index: number) {
        if ($cursor.index !== index) {
            cursor.setIndex($crossword.metadata.size, index);
        }

        dispatch("toggleSquare", index);
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeydown);

        return () => {
            window.removeEventListener("keydown", handleKeydown);
        };
    });
</script>

<div
    class="grid-designer grid absolute inset-0 aspect-square"
    style="--grid-size: {$crossword.metadata.size}"
>
    {#each $crossword.grid as square, index}
        {#key $cursor}
            <div class:ring-4={$cursor.index === index}>
                <input
                    class="w-full h-full opacity-0"
                    type="checkbox"
                    value={square.isBlack}
                    on:change={() => handleChange(index)}
                    bind:this={inputElements[index]}
                />
            </div>
        {/key}
    {/each}
</div>

<style lang="less">
    .grid-designer {
        grid-template-columns: repeat(var(--grid-size), 1fr);
        grid-template-rows: repeat(var(--grid-size), 1fr);

        &__square {
            &.selected {
                background-color: lightblue;
                opacity: 0.5;
            }
        }

        &__input {
            width: 100%;
            height: 100%;
            opacity: 0;
        }
    }
</style>
