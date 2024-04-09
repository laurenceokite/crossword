<script lang="ts">
    import cursor from "../stores/cursor";
    import editable from "../stores/editable";

    export let focused = false;
    export let editor = false;

    const crossword = editable;

    $: square = $crossword.grid[$cursor.index] ?? null;
    $: across = !square.isBlack ? square.across : null;
    $: down = !square.isBlack ? square.down : null;
</script>

{#key $crossword.clues}
    <div>
        <ul>
            {#each $crossword.clues.across as [number, clue]}
                {number + clue.toString()}
            {/each}
        </ul>
        <ul></ul>
    </div>
{/key}
