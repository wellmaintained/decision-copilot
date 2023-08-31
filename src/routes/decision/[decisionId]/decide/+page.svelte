<script lang="ts">
    import { docStore } from 'sveltefire';
	import { firestore } from '$lib/firebase';
	import { page } from '$app/stores';
	import type { Decision } from '$lib/types';
	import DecisionOptions from '$lib/components/DecisionOptions.svelte';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import { updateDoc } from 'firebase/firestore';

    const decisionId = $page.params.decisionId;
   	const decisionStore = docStore<Decision>(firestore, `decisions/${decisionId}`);

	function handleDecisionUpdate(e: CustomEvent) {
		const newDecision = e.detail;
		updateDoc(decisionStore.ref!, {
			decision: newDecision
		});
    }
</script>

<h1 class="font-bold text-2xl">Decide</h1>

<DecisionOptions {decisionStore}/>

<h2 class="font-semibold text-xl">Decision</h2>
<MarkdownEditor 
	value={$decisionStore?.decision} 
	on:blur={handleDecisionUpdate} 
/>