<script lang="ts">
    import { createEventDispatcher, setContext } from "svelte";
    import type { FormChild } from "./validation";

    const formChildren: Set<FormChild> = new Set();

    function register(child: FormChild) {
        formChildren.add(child);
    }

    function unregister(child: FormChild) {
        formChildren.delete(child);
    }

    setContext("formContext", { register, unregister });

    async function isValid(): Promise<boolean> {
        formChildren.forEach(async (c) => {
            const err = await c.validate();

            if (err) {
                c.element?.focus();
                return false;
            }
        });

        return true;
    }

    const dispatch = createEventDispatcher<{ submit: null }>();

    async function handleSubmit() {
        if (await isValid()) {
            dispatch("submit");
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <slot />
</form>
