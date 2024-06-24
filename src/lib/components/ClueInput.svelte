<script lang="ts">
    import cursor, { isAcross } from "../stores/cursor";
    import { editable } from "../stores/editable";
    import InputGridSquare from "./InputGridSquare.svelte";
    import { Record, List } from "immutable";
    import { Orientation, type Clue, type WhiteSquare } from "../types";
    import { createClueInputDispatcher } from "./clueInputDispatcher";

    export let clue: Record<Clue>;
    export let squares: List<WhiteSquare>;
    export let currentNumber: number;
    export let editor = false;
    export let focusable = false;
    export let squareInputMode = false;
    export const focusText = () => textAreaElement?.focus();
    export const focusSquares = () => {
        const pos = squares.findKey((s) => s.index === $cursor.index);
        if (pos !== undefined) {
            squareFoci[pos]();
        } else {
            cursor.setIndex($size, squares.get(0)?.index ?? $cursor.index);
            squareFoci[0]();
        }
    };

    const dispatch = createClueInputDispatcher<{
        previous: number;
        next: number;
    }>();

    const { size } = editable;

    $: number = clue.get("number");
    $: orientation = clue.get("orientation");
    $: increment = isAcross(orientation) ? 1 : $size;

    const squareFoci: { [key: number]: () => void } = {};
    let textAreaElement: HTMLTextAreaElement;
    let focused = false;

    function handleUpdateClue(event: FocusEvent) {
        if (!event.target) return;

        dispatch("updateClue", [
            orientation,
            number,
            (event.target as HTMLInputElement).value,
        ]);
    }

    function handleUpdateValue(event: CustomEvent<[number, string]>) {
        dispatch("updateValue", event.detail);

        cursor.goToNextEmptySquare(editable.crossword(), number);
    }

    function handleClearValue(event: CustomEvent<number>) {
        dispatch("clearValue", event.detail);

        const index = squares.findIndex((s) => s.index === $cursor.index);

        if (index < 1) return;

        cursor.setIndex($size, squares.get(index - 1)?.index ?? $cursor.index);
    }

    function handleSelectSquare(event: CustomEvent<number>) {
        squareInputMode = true;
        if (event.detail === $cursor.index) return;

        cursor.setIndex($size, event.detail);
    }

    function handleKeydown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
            case "ArrowUp":
                if (editor && squareInputMode) {
                    focusText();
                    event.stopPropagation();
                } else {
                    dispatch("previous", number);
                }
                break;
            case "ArrowDown":
                if (editor && !squareInputMode) {
                    focusSquares();
                    event.stopPropagation();
                } else {
                    dispatch("next", number);
                }
                break;
            case "ArrowLeft":
                if (
                    $cursor.index !== squares.first()?.index &&
                    squareInputMode
                ) {
                    const index = $cursor.index - increment;
                    cursor.setIndex($size, index);
                    event.stopPropagation();
                }
                break;
            case "ArrowRight":
                if (
                    $cursor.index !== squares.last()?.index &&
                    squareInputMode
                ) {
                    const index = $cursor.index + increment;
                    cursor.setIndex($size, index);
                    event.stopPropagation();
                }
                break;
        }
    }
</script>

{#if clue}
    <div
        role="grid"
        class="border p-2 ring-violet-200"
        class:ring={focused}
        class:bg-blue-100={focused}
        class:bg-blue-50={currentNumber ===
            squares[0][clue.get("orientation")] && !focused}
        on:focusout={() => {
            focused = false;
        }}
    >
        <div class="font-semibold">{number}</div>
        {#if editor}
            <textarea
                role="row"
                class="my-4 h-8 w-full border border-black"
                tabindex="-1"
                value={clue.get("text")}
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
            <div class="my-4">{clue.get("text")}</div>
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
                        highlighted={false}
                        focusable={focusable && squareInputMode}
                        disabled={false}
                        selected={square.index === $cursor.index}
                        ariaRowindex={undefined}
                        ariaColindex={index}
                        displayNumber={false}
                        on:updateValue={handleUpdateValue}
                        on:selectSquare={handleSelectSquare}
                        on:clearValue={handleClearValue}
                        on:keydown={handleKeydown}
                        bind:focus={squareFoci[square.index]}
                    />
                </div>
            {/each}
        </div>
    </div>
{/if}
