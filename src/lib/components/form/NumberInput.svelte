<script lang="ts">
    import { v4 as uuid } from "uuid";
    import { type FormContext, type ValidationFunction } from "./validation";
    import { getContext, hasContext, onMount } from "svelte";

    export let id = `number-input-${uuid()}`;
    export let label: string | null; // Label must be explicitly omitted
    export let ariaLabel: string | null = label;
    export let value: number;
    export let required = false;
    export let min: number = 0;
    export let max: number = Infinity;
    export let step: number | undefined = undefined;
    export let stacked = false;
    export let fullWidth = false;
    export let validation: ValidationFunction<number>[] | null = null;
    export let error: string | null = null;

    let element: HTMLInputElement;
    const form = getContext<FormContext>("formContext");

    export const validate = async () => {
        error = await _validate();
        return error;
    };

    async function _validate() {
        if (!value && required) {
            return "This value is required.";
        }

        if (validation && validation.length) {
            for (let i = 0; i < validation.length; i++) {
                const result = await validation[i](value);

                if (result) {
                    return result;
                }
            }
        }

        return null;
    }

    onMount(() => {
        if (form) {
            const child = { validate, element };
            form.register(child);
            return () => form.unregister(child);
        }
    });
</script>

<div class:flex-col={stacked}>
    {#if label}<label for={id}>{label}</label>{/if}
    <input
        type="number"
        {id}
        {min}
        {max}
        bind:this={element}
        bind:value
        on:blur={validate}
        on:input={() => (error = null)}
        aria-label={ariaLabel}
        class="input-base w-min"
        class:w-full={fullWidth}
    />
    {#if error}
        <div role="alert">{error}</div>
    {/if}
</div>

<style>
</style>
