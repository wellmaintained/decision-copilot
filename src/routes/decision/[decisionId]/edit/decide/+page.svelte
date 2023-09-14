<script lang="ts">
    import DecisionOptions from '$lib/components/DecisionOptions.svelte';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import DecisionCriteria from '$lib/components/DecisionCriteria.svelte';
	import { getContext } from 'svelte';
	import type { DecisionRepo } from '$lib/decisionRepo';

	const decisionRepo = getContext<DecisionRepo>('decisionRepo');
    const decisionData = decisionRepo.latestDecisionData;
</script>

<h1 class="font-bold text-2xl">Decide</h1>
{#if $decisionData}
	<div class="flex flex-col">
		<DecisionOptions {decisionRepo}/>
		<DecisionCriteria {decisionRepo}/>

		<h2 class="font-semibold text-xl">Decision</h2>
		<MarkdownEditor 
			value={$decisionData.decision} 
			on:blur={decisionRepo.handleDecisionUpdate} 
		/>
	</div>
{:else}
	<span class="loading loading-dots loading-md"></span>
{/if}