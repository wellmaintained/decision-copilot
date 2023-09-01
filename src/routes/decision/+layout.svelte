<script lang="ts">
	import { page } from '$app/stores';
	import AnimatedRoute from '$lib/components/AnimatedRoute.svelte';
	import AuthCheck from '$lib/components/AuthCheck.svelte';

	$: decisionId = $page.params.decisionId;
</script>

<AuthCheck>
	{#if decisionId}
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
	{/if}

	<div role="tabpanel" class="p-4 bg-base-100 border-base-300 border-l border-b border-r">
		<slot />
	</div>
</AuthCheck>
