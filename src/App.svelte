<script lang="ts">
  import { onMount } from "svelte";
  import Editor from "./lib/components/Editor.svelte";

  let theme = "white";

  // TODO: Settings Store
  onMount(() => {
    document.documentElement.setAttribute("theme", theme);
  });
</script>

<main class="">
  <Editor />
</main>

<style>
</style>
