<script lang="ts">
    import { v4 as uuid } from "uuid";

    export let id = `form-input-${uuid()}`;
    export let label: string | null;
    export let value: number;
    export let size: "sm" | "md" | "lg" | "full" = "md";
    export let min: number | undefined;
    export let max: number | undefined;
    export let stacked = false;
</script>

<div
    class="flex"
    class:w-full={size === "full"}
    class:w-ful
    class:flex-col={stacked}
>
    {#if label}<label for={id}>{label}</label>{/if}
    <input type="number" {min} {max} {id} bind:value class="input-base" />
</div>

<style>
    .input-base {
        @apply w-full h-full;
    }
</style>
