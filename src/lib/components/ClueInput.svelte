<script lang="ts">
    import type { Clue, WhiteSquare } from "../crossword";
    import type { CursorState } from "../cursor";
    import InputGridSquare from "./InputGridSquare.svelte";

    export let clue: Clue;
    export let number: number;
    export let cursor: CursorState;
    export let squares: WhiteSquare[];
</script>

<div>
    <div>{number}</div>
    <input type="text" value={clue.text} />
    {#each squares as square}
        <div class="aspect-square w-8">
            <InputGridSquare
                {square}
                highlighted={false}
                focusable={false}
                disabled={false}
                index={square.index}
                selected={square.index === cursor.index}
            />
        </div>
    {/each}
</div>
