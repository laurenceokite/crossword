<script lang="ts">
    import type { Crossword } from "../crossword";
    import InputGrid from "./InputGrid.svelte";
    import editable from "../stores/editable";
    import { updateValue } from "../editor/commands/update-value";
    import GridDesigner from "./GridDesigner.svelte";
    import { EditMode } from "../editor/types";
    import { onMount } from "svelte";
    import { toggleSquare } from "../editor/commands/toggle-square";
    import { resizeGrid } from "../editor/commands/resize";
    import NumberInput from "./form/NumberInput.svelte";
    import type { FormChild } from "./form/validation";

    export let init: Crossword | undefined = undefined;

    const MAX_GRID_SIZE = 30;
    const MIN_GRID_SIZE = 3;

    const crossword = $editable;
    let size = crossword.size;
    let editMode = EditMode.Grid;
    let validateSize: FormChild["validate"];

    function handleUpdateValue(event: CustomEvent<[number, string]>) {
        editable.execute(updateValue(...event.detail));
    }

    function handleClearValue(event: CustomEvent<number>) {
        editable.execute(updateValue(event.detail, ""));
    }

    function handleToggleSquare(event: CustomEvent<number>) {
        editable.execute(toggleSquare(event.detail));
    }

    function toggleGridMode() {
        if (editMode !== EditMode.Grid) {
            editMode = EditMode.Grid;
        } else {
            editMode = EditMode.Insert;
        }
    }

    function resize(newSize: number) {
        if (!newSize)
            if (newSize > MAX_GRID_SIZE) {
                size = MAX_GRID_SIZE;
                return;
            }

        if (newSize < MIN_GRID_SIZE) {
            size = MIN_GRID_SIZE;
            return;
        }

        if (newSize !== crossword.size) {
            editable.execute(resizeGrid(newSize));
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
            case "Escape":
                toggleGridMode();
        }
    }

    onMount(() => {
        if (init) {
            editable.load(init);
        }
        window.addEventListener("keydown", handleKeydown);
    });
</script>

<div class="">
    <fieldset id="editorModeRadioGroup">
        <legend>Editor Mode [Esc]</legend>
        <label for="gridModeRadioButton">Grid</label>
        <input
            type="radio"
            id="gridModeRadioButton"
            bind:group={editMode}
            value={EditMode.Grid}
        />

        <label for="insertModeRadioButton">Insert</label>
        <input
            type="radio"
            id="insertModeRadioButton"
            bind:group={editMode}
            value={EditMode.Insert}
        />
    </fieldset>
    {#key $editable.history}
        <button
            type="button"
            on:click={() => editable.undo()}
            disabled={!crossword.history.undo.length}
        >
            Undo
        </button>

        <button
            type="button"
            on:click={() => editable.redo()}
            disabled={!crossword.history.redo.length}
        >
            Redo
        </button>
    {/key}
</div>
<div class="editor-grid flex items-center justify-center">
    <InputGrid
        on:updateValue={handleUpdateValue}
        on:clearValue={handleClearValue}
        editor={true}
        disabled={editMode !== EditMode.Insert}
    >
        {#if editMode === EditMode.Grid}
            <GridDesigner on:toggleSquare={handleToggleSquare} />
        {/if}
    </InputGrid>
</div>

<style>
    :root {
        --grid-dimension: 100vw;
    }

    @media (min-aspect-ratio: 1/1) {
        :root {
            --grid-dimension: 70vh;
        }
    }
    .editor-grid {
        width: var(--grid-dimension);
        height: var(--grid-dimension);
    }
</style>
