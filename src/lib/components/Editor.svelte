<script lang="ts">
    import type { Crossword } from "../crossword";
    import InputGrid from "./InputGrid.svelte";
    import editable from "../stores/editable";
    import { type CursorState, Orientation } from "../cursor";
    import { updateValue } from "../editor/commands/update-value";
    import GridDesigner from "./GridDesigner.svelte";
    import { EditMode } from "../editor/types";
    import { onMount } from "svelte";
    import { toggleSquare } from "../editor/commands/toggle-square";

    export let init: Crossword | undefined = undefined;

    let cursor: CursorState = {
        orientation: Orientation.Across,
        index: 0
    }
    let editMode = EditMode.Grid;
    const crossword = $editable;

    function handleInput(event: CustomEvent<string>) {
        const value = event.detail;
        editable.execute(updateValue(cursor.index, value));
    };

    function handleToggleSquare(event: CustomEvent<number>) {
        const index = event.detail;
        editable.execute(toggleSquare(index));
    }

    function toggleGridMode() {
        if (editMode !== EditMode.Grid) {
            editMode = EditMode.Grid;
        } else {
            editMode = EditMode.Insert
        }
    }

    onMount(() => {
        if (init) {
            editable.load(init);
        }
    });

</script>

<div class="editor">
    {#if crossword}
        <div class="editor__grid">
            <InputGrid
                on:input={handleInput}
                editor={true} 
                disabled={editMode !== EditMode.Insert}
            />
            {#if editMode === EditMode.Grid}
                <GridDesigner />
            {/if}
        </div>
    {/if}
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
        &__grid {
            position: relative;
            height: var(--grid-dimension);
            width: var(--grid-dimension);
            max-width: 1200px;
        }
    }
</style>