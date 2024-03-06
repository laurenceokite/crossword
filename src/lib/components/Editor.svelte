<script lang="ts">
    import type { Crossword } from "$lib/crossword";
    import { EditableCrossword } from "$lib/editor/editable";
    import { Direction, EditMode, Orientation } from "$lib/editor/types";
    import { writable, readable } from "svelte/store";
    import EditorGrid from "./EditorGrid.svelte";

    export let init: Crossword = {
        grid: [],
        size: 15
    };

    export const cursor = createCursor();

    $: crossword = readable(new EditableCrossword(init));

    function createCursor() {
        const { subscribe, set, update } = writable({
            index: 0,
            orientation: Orientation.Across,
            mode: EditMode.Grid,
        });

        function move(direction: Direction) {

        }

        return {
            subscribe
        }
    };

</script>

<div>
    <div>
        <EditorGrid {crossword}/>
    </div>
</div>