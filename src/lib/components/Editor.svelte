<script lang="ts">
    import type { Crossword } from "$lib/crossword";
    import EditorGrid from "./EditorGrid.svelte";
    import editable from "$lib/editor/editable";
    import { Orientation } from "$lib/types";
    import type { CursorState } from "$lib/cursor";

    export let init: Crossword;
    let cursor: CursorState = {
        orientation: Orientation.Across,
        index: 0
    }
    const crossword = $editable;

    $: editable.load(init);

</script>

<div>
    <div>
        <EditorGrid bind:cursor />
    </div>
</div>