<script lang="ts">
    import type { Crossword } from "$lib/crossword";
    import EditorGrid from "./EditorGrid.svelte";
    import editable from "$lib/editor/editable";
    import { Orientation, type CursorState } from "$lib/editor/types";

    export let init: Crossword;
    let cursor: CursorState = {
        orientation: Orientation.Across,
        index: 0,
        x: 0,
        y: 0
    }
    const crossword = $editable;

    $: editable.load(init);
    $: cursor = {
        ...cursor,
        x: cursor.index % crossword.size,
        y: cursor.index / crossword.size
    }    
</script>

<div>
    <div>
        <EditorGrid />
    </div>
</div>