<script lang="ts">
    import type { Crossword } from "$lib/crossword";
    import InputGrid from "./InputGrid.svelte";
    import editable from "$lib/editor/editable";
    import { type CursorState, Orientation } from "$lib/cursor";
    import { updateValue } from "$lib/editor/commands/update-value";
    import GridDesigner from "./GridDesigner.svelte";
    import { EditMode } from "$lib/editor/types";
    import { onMount } from "svelte";

    export let init: Crossword | undefined = undefined;

    let cursor: CursorState = {
        orientation: Orientation.Across,
        index: 0
    }
    let editMode = EditMode.Grid;
    const crossword = $editable;

    $: if (init) {
        editable.load(init);
    }

    function handleInput(event: CustomEvent<string>) {
        const value = event.detail;
        editable.execute(updateValue(cursor.index, value));
    };

    function handleKeydown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
            case 'Escape':
                event.preventDefault();
                toggleGridMode();
        }
    }

    function toggleGridMode() {
        if (editMode !== EditMode.Grid) {
            editMode = EditMode.Grid;
        } else {
            editMode = EditMode.Insert
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });

</script>

<div class="editor">
    {#if crossword}
        <div class="editor__grid">
            <InputGrid 
                bind:cursor 
                on:input={handleInput} 
                --grid-size={crossword.size} 
                disabled={editMode !== EditMode.Insert}
            />
            {#if editMode === EditMode.Grid}
                <GridDesigner 
                    bind:cursor 
                    --grid-size={crossword.size} 
                />
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