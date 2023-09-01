<script lang="ts">
    import { docStore } from 'sveltefire';
	import { firestore } from '$lib/firebase';
	import DecisionOptions from '$lib/components/DecisionOptions.svelte';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import DecisionCriteria from '$lib/components/DecisionCriteria.svelte';
	import { getContext } from 'svelte';
	import type { Decision } from '$lib/types';
	import type { DecisionRepo } from '$lib/decisionRepo';

	const decisionRepo = getContext('decisionRepo') as DecisionRepo;
    const decisionStore = docStore<Decision>(firestore, `decisions/${decisionRepo.decisionId}`);
	
</script>

<h1 class="font-bold text-2xl">Decide</h1>

<DecisionOptions {decisionRepo}/>
<DecisionCriteria {decisionRepo}/>

<h2 class="font-semibold text-xl">Decision</h2>
<MarkdownEditor 
	value={$decisionStore?.decision} 
	on:blur={decisionRepo.handleDecisionUpdate} 
/>