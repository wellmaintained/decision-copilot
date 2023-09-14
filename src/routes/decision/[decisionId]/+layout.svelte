<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import DecisionSteps from '$lib/components/DecisionSteps.svelte';
	import { createDecisionRepo } from '$lib/decisionRepo';
	import { setContext } from 'svelte';
	
	const decisionId = $page.params.decisionId;
	const decisionRepo = createDecisionRepo(decisionId);
	const decisionData = decisionRepo.latestDecisionData;
	setContext('decisionRepo', decisionRepo);

	let activeTab = 'identify';
	$: {
		if ($page.route.id?.includes('identify')) {
			activeTab = 'identify';
		} else if ($page.route.id?.includes('process')) {
			activeTab = 'process';
		} else if ($page.route.id?.includes('decide')) {
			activeTab = 'decide';
		}
	} 

	function gotoNextStep(event: Event) {
		switch (activeTab) {
			case 'identify':
				goto(`/decision/${decisionId}/edit/process`);
				break;
			case 'process':
				goto(`/decision/${decisionId}/edit/decide`);
				break;
			case 'decide':
				decisionRepo.updateDecisionField('status', 'published');
				goto(`/decision/${decisionId}`);
				break;
		}
	}
</script>

<AuthCheck>
{#if $decisionData?.status === 'published' && $page.route.id?.includes('edit')}
	<div class="alert alert-error">Error: Published decisions cannot be edited.</div>
{:else if $decisionData?.status === 'published'}
	<div class="flex flex-col">
		<slot />
	</div>
{:else}
	<div class="flex flex-col-reverse sm:flex-row">
		<div class="sm:w-1/4 h-max p-4 mt-10 border bg-base-100 border-base-300">
			<DecisionSteps decision={decisionRepo.latestDecisionData}/>
		</div>
		<div class="sm:w-3/4 pl-2">
			<div role="tablist" class="tabs tabs-lifted">
				<a  role="tab"
					href="/decision/{decisionId}/edit/identify"
					class="tab h-10"
					class:tab-active={activeTab == 'identify'}
				>
					Identify
				</a>
				<a  role="tab"
					href="/decision/{decisionId}/edit/process"
					class="tab h-10"
					class:tab-active={activeTab == 'process'}
				>
					Process
				</a>
				<a  role="tab"
					href="/decision/{decisionId}/edit/decide"
					class="tab h-10"
					class:tab-active={activeTab == 'decide'}
				>
					Decide
				</a>
			</div>				
			<div role="tabpanel" class="p-4 bg-base-100 border-base-300 border-l border-b border-r flex flex-col">
				<slot />
				<button class="btn btn-primary w-1/4 ml-auto mt-6" on:click|preventDefault={gotoNextStep}>Next</button>
			</div>
		</div>
	</div>
{/if}
</AuthCheck>
