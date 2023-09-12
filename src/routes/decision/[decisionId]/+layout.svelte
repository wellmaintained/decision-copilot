<script lang="ts">
	import { page } from '$app/stores';
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import DecisionSteps from '$lib/components/DecisionSteps.svelte';
	import { createDecisionRepo } from '$lib/decisionRepo';
	import { setContext } from 'svelte';
	
	const decisionId = $page.params.decisionId;
	const decisionRepo = createDecisionRepo(decisionId);
	setContext('decisionRepo', decisionRepo);
</script>

<AuthCheck>
{#if decisionId}
	<div class="flex flex-row">
		<div class="w-1/4 h-max p-4 mt-10 border bg-base-100 border-base-300">
			<DecisionSteps decision={decisionRepo.latestDecisionData}/>
		</div>
		<div class="pl-2 w-3/4">
			<div role="tablist" class="tabs tabs-lifted">
				<a  role="tab"
					href="/decision/{decisionId}/identify"
					class="tab h-10"
					class:tab-active={$page.route.id?.includes('identify')}
				>
					Identify
				</a>
				<a  role="tab"
					href="/decision/{decisionId}/process"
					class="tab h-10"
					class:tab-active={$page.route.id?.includes('process')}
				>
					Process
				</a>
				<a  role="tab"
					href="/decision/{decisionId}/decide"
					class="tab h-10"
					class:tab-active={$page.route.id?.includes('decide')}
				>
					Decide
				</a>
				<a  role="tab"
					href="/decision/{decisionId}/view"
					class="tab h-10"
					class:tab-active={$page.route.id?.includes('view')}
				>
					View
				</a>
			</div>				
			<div role="tabpanel" class="p-4 bg-base-100 border-base-300 border-l border-b border-r">
				<slot />
			</div>
		</div>
	</div>
{:else}
	<div class="alert alert-error">No Decision Id provided in Url</div>
{/if}
</AuthCheck>
