<script lang="ts">
    import type { Crossword } from "$lib/crossword";
    import EditorGrid from "./EditorGrid.svelte";
    import editable from "$lib/editor/editable";
    import { Orientation } from "$lib/types";
    import type { CursorState } from "$lib/cursor";
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

<div>
    <div>
        <EditorGrid bind:cursor on:input={handleInput}/>
    </div>
</div>