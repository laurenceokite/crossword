<script lang="ts">
    import InputGrid from "./InputGrid.svelte";
    import { editable } from "../stores/editable";
    import GridDesigner from "./GridDesigner.svelte";
    import { onMount } from "svelte";
    import { MAX_GRID_SIZE, MIN_GRID_SIZE } from "../constants";
    import { type Crossword, Orientation } from "../types";
    import { updateValue } from "../commands/update-value";
    import { toggleSquare } from "../commands/toggle-square";
    import { resizeGrid } from "../commands/resize";
    import { updateClueText } from "../commands/update-clue";
    import ClueList from "./ClueList.svelte";
    import { cursor } from "../stores/cursor";

    export let init: Crossword | undefined = undefined;

    const { size } = editable;

    let gridMode = true;
    let autoSymmetry = true;
    let sizeInputValue = $size;
    let focusGridDesigner: () => void;

    enum Section {
        Grid,
        MiniClue,
        Clues,
        Control,
    }
    let focus = Section.Grid;

    function handleUpdateValue(event: CustomEvent<[number, string]>) {
        editable.execute(updateValue(...event.detail));
    }

    function handleClearValue(event: CustomEvent<number>) {
        editable.execute(updateValue(event.detail, ""));
    }

    function handleToggleSquare(event: CustomEvent<number>) {
        editable.execute(toggleSquare(event.detail, autoSymmetry));
    }

    function handleUpdateClue(
        event: CustomEvent<[Orientation, number, string]>,
    ) {
        editable.execute(updateClueText(...event.detail));
    }

    function resize() {
        if (!sizeInputValue || sizeInputValue === $size) return;

        if (sizeInputValue > MAX_GRID_SIZE) {
            sizeInputValue = MAX_GRID_SIZE;
        }

        if (sizeInputValue < MIN_GRID_SIZE) {
            sizeInputValue = MIN_GRID_SIZE;
        }

        if (sizeInputValue !== $size) {
            editable.execute(resizeGrid(sizeInputValue));
        }
    }

    function toggleGridMode() {
        gridMode = !gridMode;
        if (gridMode) {
            focusGridDesigner();
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
        cursor.initialize(editable.crossword());
        window.addEventListener("keydown", handleKeydown);
    });
</script>

<div class="@container flex w-full max-h-screen pt-24">
    <section
        class="absolute h-24 top-0 left-0 right-0"
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
                bind:group={gridMode}
                value={true}
            />

            <label for="insertModeRadioButton">Insert</label>
            <input
                type="radio"
                id="insertModeRadioButton"
                bind:group={gridMode}
                value={false}
            />
        </fieldset>
        <button
            type="button"
            on:click={() => editable.undo()}
            disabled={!editable.history().undo.length}
        >
            Undo
        </button>

        <button
            type="button"
            on:click={() => editable.redo()}
            disabled={!editable.history().redo.length}
        >
            Redo
        </button>

        <input
            type="checkbox"
            id="autoSymmetryToggle"
            bind:checked={autoSymmetry}
        />
        <label for="autoSymmetryToggle">Auto-Symmetry</label>

        <input
            type="number"
            min={MIN_GRID_SIZE}
            max={MAX_GRID_SIZE}
            bind:value={sizeInputValue}
            on:blur={() => resize()}
            on:click={() => resize()}
        />
    </section>

    <section
        class="flex flex-1 justify-center"
        on:focusin={() => {
            if (focus === Section.Grid) return;
            focus = Section.Grid;
        }}
    >
        <InputGrid
            on:updateValue={handleUpdateValue}
            on:clearValue={handleClearValue}
            focused={focus === Section.Grid}
            disabled={gridMode}
        >
            {#if gridMode}
                <GridDesigner
                    on:toggleSquare={handleToggleSquare}
                    focusable={focus === Section.Grid}
                    bind:focus={focusGridDesigner}
                />
            {/if}
        </InputGrid>
    </section>

    <section
        class="flex flex-1 justify-center"
        on:focusin={() => {
            if (focus === Section.Clues) return;
            focus = Section.Clues;
            gridMode = false;
        }}
    >
        {#each [Orientation.Across, Orientation.Down] as orientation}
            <ClueList
                editor={true}
                focusable={focus === Section.Clues}
                {orientation}
                on:updateClue={handleUpdateClue}
                on:updateValue={handleUpdateValue}
                on:clearValue={handleClearValue}
            />
        {/each}
    </section>
</div>
