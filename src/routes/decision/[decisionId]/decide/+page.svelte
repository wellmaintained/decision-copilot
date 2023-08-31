<script lang="ts">
    import { docStore } from 'sveltefire';
	import { firestore } from '$lib/firebase';
	import { page } from '$app/stores';
	import type { Decision } from '$lib/types';
	import DecisionOptions from '$lib/components/DecisionOptions.svelte';

    const decisionId = $page.params.decisionId;
   	const decisionStore = docStore<Decision>(firestore, `decisions/${decisionId}`);
</script>

<h2>Decide</h2>

<DecisionOptions {decisionStore}/>