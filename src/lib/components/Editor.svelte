<script lang="ts">
    import InputGrid from "./InputGrid.svelte";
    import editable from "../stores/editable";
    import GridDesigner from "./GridDesigner.svelte";
    import { onMount } from "svelte";
    import { MAX_GRID_SIZE, MIN_GRID_SIZE } from "../constants";
    import ClueInput from "./ClueInput.svelte";
    import { EditMode, type Crossword } from "../types";
    import { updateValue } from "../commands/update-value";
    import { toggleSquare } from "../commands/toggle-square";
    import { resizeGrid } from "../commands/resize";

    export let init: Crossword | undefined = undefined;

    const crossword = editable;
    let size = $crossword.metadata.size;
    let editMode = EditMode.Grid;

    enum Section {
        Grid,
        Clues,
        Control,
    }
    let focus = Section.Grid;

    function handleUpdateValue(event: CustomEvent<[number, string]>) {
        crossword.execute(updateValue(...event.detail));
    }

    function handleClearValue(event: CustomEvent<number>) {
        crossword.execute(updateValue(event.detail, ""));
    }

    function handleToggleSquare(event: CustomEvent<number>) {
        crossword.execute(toggleSquare(event.detail));
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

        if (newSize !== $crossword.metadata.size) {
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
            crossword.load(init);
        }
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
        {#key $crossword.history}
            <button
                type="button"
                on:click={() => editable.undo($crossword.history)}
                disabled={!$crossword.history.undo.length}
            >
                Undo
            </button>

            <button
                type="button"
                on:click={() => editable.redo($crossword.history)}
                disabled={!$crossword.history.redo.length}
            >
                Redo
            </button>
        {/key}

        <div></div>
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
            editor={true}
            {editMode}
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
        class="flex flex-1 justify-center"
        on:focusin={() => {
            if (focus === Section.Clues) return;
            focus = Section.Clues;
            editMode = EditMode.Insert;
        }}
    >
        <div class="flex max-h-full">
            <ul class="overflow-auto">
                {#each [...$crossword.clues.across.keys()] as number}
                    <li>
                        <ClueInput
                            {number}
                            editor={true}
                            focusable={focus === Section.Clues}
                            on:updateValue={handleUpdateValue}
                        />
                    </li>
                {/each}
            </ul>
            <ul class="overflow-auto">
                {#each [...$crossword.clues.down.keys()] as number}
                    <li>
                        <ClueInput
                            {number}
                            editor={true}
                            focusable={focus === Section.Clues}
                            on:updateValue={handleUpdateValue}
                            on:clearValue={handleClearValue}
                        />
                    </li>
                {/each}
            </ul>
        </div>
    </section>
</div>
