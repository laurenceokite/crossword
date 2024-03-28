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

    let editMode = EditMode.Grid;
    const crossword = $editable;

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

<div class="editor">
    {#if crossword}
        <div class="editor__grid">
            <InputGrid
                on:updateValue={handleUpdateValue}
                on:clearValue={handleClearValue}
                editor={true}
                disabled={editMode !== EditMode.Insert}
            />
            {#if editMode === EditMode.Grid}
                <GridDesigner on:toggleSquare={handleToggleSquare} />
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

