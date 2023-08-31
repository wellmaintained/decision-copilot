<script lang="ts">
	import { page } from '$app/stores';
	import AnimatedRoute from '$lib/components/AnimatedRoute.svelte';
	import AuthCheck from '$lib/components/AuthCheck.svelte';

	$: decisionId = $page.params.decisionId;
</script>

<AuthCheck>
	{#if decisionId}
		<nav class="flex justify-center my-6">
			<ul class="steps">
				<a href="/decision" class="step step-primary">Decision List</a>

				<a
					href="/decision/{decisionId}/identify"
					class="step"
					class:step-primary={$page.route.id?.match(/identify|process|decide|view/g)}
				>
					Identify
				</a>
				<a
					href="/decision/{decisionId}/process"
					class="step"
					class:step-primary={$page.route.id?.match(/process|decide|view/g)}
				>
					Process
				</a>
				<a
					href="/decision/{decisionId}/decide"
					class="step"
					class:step-primary={$page.route.id?.match(/decide|view/g)}
				>
					Decide
				</a>
				<a
					href="/decision/{decisionId}/view"
					class="step"
					class:step-primary={$page.route.id?.includes('view')}
				>
					View
				</a>
			</ul>
		</nav>
	{/if}

	<div class="card card-compact bg-base-100 shadow">
		<div class="card-body">
			<slot />
		</div>
	</div>
</AuthCheck>
