<script lang="ts">
  import { onMount } from "svelte"
  import "../app.css"
  import Header from "$lib/components/Header.svelte"
  import Footer from "$lib/components/Footer.svelte"

  let { children } = $props()

  onMount(async () => {
    await import("@aura/ui")
  })
</script>

<Header />
{@render children()}
<Footer />
