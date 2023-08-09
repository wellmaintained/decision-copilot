<script>
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
</script>

{#key $page.url}
	<div in:fly={{ y: 200, duration: 700 }}>
		<slot />
	</div>
{/key}
