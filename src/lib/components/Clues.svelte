<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { WhiteSquare } from "../crossword";
    import { Orientation } from "../cursor";
    import cursor from "../stores/cursor";
    import editable from "../stores/editable";
    import ClueInput from "./ClueInput.svelte";

    export let focused = false;
    export let editor = false;

    const dispatch = createEventDispatcher<{
        selectSquare: number;
        updateValue: [number, string];
    }>();

    const crossword = editable;

    $: square = $crossword.grid[$cursor.index] ?? null;
    $: currentNumber = !square.isBlack
        ? { across: square.across, down: square.down }
        : null;

    function handleSelectSquare(event: CustomEvent<number>) {
        if ($cursor.index === event.detail) return;

        cursor.setIndex($crossword.metadata.size, event.detail);
        dispatch("selectSquare", event.detail);
    }
</script>
