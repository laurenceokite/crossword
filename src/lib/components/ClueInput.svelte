<script lang="ts">
    import cursor from "../stores/cursor";
    import editable from "../stores/editable";
    import InputGridSquare from "./InputGridSquare.svelte";
    import { Orientation } from "../types";
    import { createClueInputDispatcher } from "./clueInputDispatcher";

    export let number: number;
    export let orientation: Orientation;
    export let editor = false;
    export let focusable = false;
    export const focusText = () => textAreaElement?.focus();
    export const focusSquares = () => {
        let position = Math.max(
            0,
            indices.findIndex((i) => i === $cursor.index),
        );
        const index = indices[position];
        squareInputElements[position]?.focus();
        cursor.setIndex($crossword.size, index);
    };

    const dispatch = createClueInputDispatcher<{
        previous: void;
        next: void;
    }>();

    const crossword = editable;
    let squareInputMode = false;
    let indices: number[];
    let textAreaElement: HTMLTextAreaElement;
    let focused = false;
    let squareInputElements: HTMLInputElement[] = [];

    $: currentNumber = $crossword.grid[$cursor.index][$cursor.orientation];
    $: selected =
        number === currentNumber && orientation === $cursor.orientation;
    $: indices = $crossword[orientation][number]?.squares ?? [];
    $: clue = $crossword[orientation][number] ?? null;

    $: if (!selected && squareInputMode) {
        squareInputMode = false;
    }

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

        const index = indices.findIndex((i) => i === $cursor.index);

        if (index >= indices.length - 1) {
            dispatch("next");
            return;
        }

        cursor.setIndex($crossword.size, indices[index + 1]);
    }

    function handleClearValue(event: CustomEvent<number>) {
        dispatch("clearValue", event.detail);

        const index = indices.findIndex((i) => i === $cursor.index);

        if (index < 1) return;

        cursor.setIndex($crossword.size, indices[index - 1]);
    }

    function handleSelectSquare(event: CustomEvent<number>) {
        if (event.detail === $cursor.index) return;

        cursor.setIndex($crossword.size, event.detail);
    }

    function handleKeydown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
            case "ArrowUp":
                if (editor && squareInputMode) {
                    focusText();
                    event.stopPropagation();
                } else {
                    dispatch("previous");
                }
                break;
            case "ArrowDown":
                if (editor && !squareInputMode) {
                    focusSquares();
                    event.stopPropagation();
                } else {
                    dispatch("next");
                }
                break;
            case "ArrowLeft":
                if ($cursor.index !== indices[0] && squareInputMode) {
                    const increment =
                        $cursor.orientation === Orientation.Across
                            ? 1
                            : $crossword.size;

                    const index = $cursor.index - increment;
                    cursor.setIndex($crossword.size, index);
                    event.stopPropagation();
                }
                break;
            case "ArrowRight":
                if (
                    $cursor.index !== indices[indices.length - 1] &&
                    squareInputMode
                ) {
                    const increment =
                        $cursor.orientation === Orientation.Across
                            ? 1
                            : $crossword.size;
                    const index = $cursor.index + increment;
                    cursor.setIndex($crossword.size, index);
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
        class:bg-blue-50={selected && !focused}
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
                value={clue.text}
                bind:this={textAreaElement}
                on:focus={() => {
                    focused = true;
                    squareInputMode = false;
                    if (indices.every((i) => i !== $cursor.index)) {
                        cursor.setIndex($crossword.size, indices[0]);
                    }
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
            {#each indices.map((i) => $crossword.grid[i]) as square, index}
                {#if square && !square.isBlack}
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
                            bind:inputElement={squareInputElements[index]}
                        />
                    </div>
                {/if}
            {/each}
        </div>
    </div>
{/if}
