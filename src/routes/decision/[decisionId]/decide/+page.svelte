<script lang="ts">
    import DecisionOptions from '$lib/components/DecisionOptions.svelte';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import DecisionCriteria from '$lib/components/DecisionCriteria.svelte';
	import { getContext } from 'svelte';
	import type { DecisionRepo } from '$lib/decisionRepo';

	const decisionRepo = getContext('decisionRepo') as DecisionRepo;
    const decisionData = decisionRepo.latestDecisionData;
</script>

<h1 class="font-bold text-2xl">Decide</h1>
{#if $decisionData}
	<DecisionOptions {decisionRepo}/>
	<DecisionCriteria {decisionRepo}/>

	<h2 class="font-semibold text-xl">Decision</h2>
	<MarkdownEditor 
		value={$decisionData.decision} 
		on:blur={decisionRepo.handleDecisionUpdate} 
	/>
{:else}
	<p>loading...</p>
{/if}