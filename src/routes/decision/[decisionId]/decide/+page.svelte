<script lang="ts">
    import { docStore } from 'sveltefire';
	import { firestore } from '$lib/firebase';
	import type { Decision, DecisionContext } from '$lib/types';
	import DecisionOptions from '$lib/components/DecisionOptions.svelte';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import DecisionCriteria from '$lib/components/DecisionCriteria.svelte';
	import { getContext } from 'svelte';

	const decisionContext = getContext('decisionContext') as DecisionContext;
   	const decisionStore = docStore<Decision>(firestore, `decisions/${decisionContext.decisionId}`);

</script>

<h1 class="font-bold text-2xl">Decide</h1>

<DecisionOptions {decisionStore}/>
<DecisionCriteria {decisionStore}/>

<h2 class="font-semibold text-xl">Decision</h2>
<MarkdownEditor 
	value={$decisionContext.decision} 
	on:blur={decisionContext.handleDecisionUpdate} 
/>