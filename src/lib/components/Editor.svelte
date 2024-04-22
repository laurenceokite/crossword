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
    import { MAX_GRID_SIZE, MIN_GRID_SIZE } from "../constants";
    import Clues from "./Clues.svelte";

    export let init: Crossword | undefined = undefined;

    const crossword = $editable;
    let size = crossword.metadata.size;
    let editMode = EditMode.Grid;

    enum Section {
        Grid,
        Clues,
        Control,
    }
    let focus = Section.Grid;

    $: console.log(focus);

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

        if (newSize !== crossword.metadata.size) {
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

<section
    class=""
    on:focusin={() => {
        if (focus === Section.Control) return;
        focus = Section.Control;
    }}
>
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
            on:click={() => editable.undo(crossword.history)}
            disabled={!crossword.history.undo.length}
        >
            Undo
        </button>

        <button
            type="button"
            on:click={() => editable.redo(crossword.history)}
            disabled={!$editable.history.redo.length}
        >
            Redo
        </button>
    {/key}
</section>

<section
    class="editor-grid flex items-center justify-center"
    on:focusin={() => {
        if (focus === Section.Grid) return;
        focus = Section.Grid;
    }}
>
    <InputGrid
        on:updateValue={handleUpdateValue}
        on:clearValue={handleClearValue}
        focused={focus === Section.Grid}
        editor={true}
        disabled={editMode !== EditMode.Insert}
    >
        {#if editMode === EditMode.Grid}
            <GridDesigner
                on:toggleSquare={handleToggleSquare}
                focusable={focus === Section.Grid}
            />
        {/if}
    </InputGrid>
</section>

<section
    on:focusin={() => {
        if (focus === Section.Clues) return;
        focus = Section.Clues;
        editMode = EditMode.Insert;
    }}
>
    <Clues
        editor={true}
        focused={focus === Section.Clues}
        on:updateValue={handleUpdateValue}
    />
</section>
