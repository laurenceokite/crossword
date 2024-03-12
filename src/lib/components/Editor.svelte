<script lang="ts">
    import type { Crossword } from "$lib/crossword";
    import InputGrid from "./InputGrid.svelte";
    import editable from "$lib/editor/editable";
    import { type CursorState, Orientation } from "$lib/cursor";
    import { updateValue } from "$lib/editor/commands/update-value";

    export let init: Crossword;
    let cursor: CursorState = {
        orientation: Orientation.Across,
        index: 0
    }
    const crossword = $editable;

    $: editable.load(init);

    function handleInput(event: CustomEvent<string>) {
        const value = event.detail;
        editable.execute(updateValue(cursor.index, value));
    };

</script>

<div class="editor">
    <div class="editor__input-grid">
        <InputGrid bind:cursor on:input={handleInput}/>
    </div>
</div>

<style lang="less">
    :root {
        --grid-dimension: 90vw;
    }

    @media (min-aspect-ratio: 1/1) {
        :root {
            --grid-dimension: 90vh;
        }
    }
    .editor {
        &__input-grid {
            height: var(--grid-dimension);
            width: var(--grid-dimension);
            max-width: 1200px;
        }
    }
</style>