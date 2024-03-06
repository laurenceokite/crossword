<script lang="ts">
    import type { Crossword } from "$lib/crossword";
    import EditorGrid from "./EditorGrid.svelte";
    import editable from "$lib/editor/editable";

    export let init: Crossword = {
        grid: [],
        size: 15
    };

    $: editable.load(init);    
</script>

<div>
    <div>
        <EditorGrid />
    </div>
</div>