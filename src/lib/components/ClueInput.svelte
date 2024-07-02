<script lang="ts">
    import { cursor, isAcross } from "../stores/cursor";
    import { editable } from "../stores/editable";
    import InputGridSquare from "./InputGridSquare.svelte";
    import { Direction, type Clue, Square } from "../types";
    import { createClueInputDispatcher } from "./clueInputDispatcher";

    export let clue: Clue;
    export let editor = false;
    export let focusable = false;
    export let squareInputMode = true;
    export let goToNextEmpty = true;
    export let squares: Square[];
    export const focusText = () => textAreaElement?.focus();
    export const focusSquares = () => {
        squareInputMode = true;
    };

    const dispatch = createClueInputDispatcher<{
        previous: number;
        next: number;
    }>();

    $: direction = isAcross(clue.orientation)
        ? { left: Direction.Left, right: Direction.Right }
        : { left: Direction.Up, right: Direction.Down };
    $: if (
        $cursor.number === clue.number &&
        $cursor.number !== $cursor.previousNumber
    ) {
        goToNextEmpty = true;
    }

    let textAreaElement: HTMLTextAreaElement;
    let focused = false;

    function handleUpdateClue(event: FocusEvent) {
        if (!event.target) return;

        dispatch("updateClue", [
            clue.orientation,
            clue.number,
            (event.target as HTMLInputElement).value,
        ]);
    }

    function handleUpdateValue(event: CustomEvent<[number, string]>) {
        dispatch("updateValue", event.detail);

        cursor.goToNextEmptySquare(editable.crossword(), new Set(clue.indices));
    }

    function handleClearValue(event: CustomEvent<number>) {
        dispatch("clearValue", event.detail);

        const index = squares?.findIndex((s) => s.index === $cursor.index);

        if (!index || index < 1) return;

        cursor.setIndex(
            editable.crossword(),
            squares[index - 1].index ?? $cursor.index,
        );
    }

    function handleSelectSquare(event: CustomEvent<number>) {
        squareInputMode = true;
        if (event.detail === $cursor.index) return;

        cursor.setIndex(editable.crossword(), event.detail);
    }

    function handleKeydown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
            case "ArrowUp":
                if (editor && squareInputMode) {
                    focusText();
                    event.stopPropagation();
                } else {
                    dispatch("previous", clue.number);
                }
                break;
            case "ArrowDown":
                if (editor && !squareInputMode) {
                    goToNextEmpty = true;
                    focusSquares();
                    event.stopPropagation();
                } else {
                    dispatch("next", clue.number);
                }
                break;
            case "ArrowLeft":
                if ($cursor.index !== squares[0].index && squareInputMode) {
                    goToNextEmpty = false;
                    cursor.move(editable.crossword(), direction.left, true);
                    event.stopPropagation();
                }
                break;
            case "ArrowRight":
                if (
                    $cursor.index !== squares[squares.length - 1].index &&
                    squareInputMode
                ) {
                    goToNextEmpty = false;
                    cursor.move(editable.crossword(), direction.right, true);
                    event.stopPropagation();
                }
                break;
        }
    }
</script>

{#if clue && squares}
    <div
        role="grid"
        class="border p-2 ring-violet-200"
        class:ring={focused}
        class:bg-blue-100={focused}
        class:bg-blue-50={$cursor.number === clue.number && !focused}
        on:focusout={() => {
            focused = false;
        }}
    >
        <div class="font-semibold">{clue.number}</div>
        {#if editor}
            <textarea
                role="row"
                class="my-4 h-8 w-full border border-black"
                tabindex="-1"
                value={clue.text}
                bind:this={textAreaElement}
                on:focus={() => {
                    focused = true;
                    squareInputMode = false;
                    focusSquares();
                }}
                on:blur={handleUpdateClue}
                on:keydown={handleKeydown}
            ></textarea>
        {:else}
            <div class="my-4">{clue.text}</div>
        {/if}
        <div
            role="row"
            class="flex border border-black w-fit bg-white"
            tabindex="-1"
            on:focusin={() => {
                focused = true;
                squareInputMode = true;
            }}
        >
            {#each squares as square, index}
                <div class="w-8">
                    <InputGridSquare
                        {square}
                        focusable={focusable && squareInputMode}
                        disabled={false}
                        selected={$cursor.index === square.index}
                        highlighted={false}
                        ariaRowindex={undefined}
                        ariaColindex={index}
                        displayNumber={false}
                        on:updateValue={handleUpdateValue}
                        on:selectSquare={handleSelectSquare}
                        on:clearValue={handleClearValue}
                        on:keydown={handleKeydown}
                    />
                </div>
            {/each}
        </div>
    </div>
{/if}
