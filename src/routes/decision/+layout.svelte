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
					class:step-primary={$page.route.id?.match(/identify|process|details|workflow/g)}
				>
					Identify
				</a>
				<a
					href="/decision/{decisionId}/process"
					class="step"
					class:step-primary={$page.route.id?.match(/process|details|workflow/g)}
				>
					Process
				</a>
				<a
					href="/decision/{decisionId}/details"
					class="step"
					class:step-primary={$page.route.id?.match(/details|workflow/g)}
				>
					Details
				</a>
				<a
					href="/decision/{decisionId}/workflow"
					class="step"
					class:step-primary={$page.route.id?.includes('workflow')}
				>
					Workflow
				</a>
			</ul>
		</nav>
	{/if}

	<AnimatedRoute>
		<div class="card w-4/6 mx-auto bg-base-100">
			<div class="card-body">
				<slot />
			</div>
		</div>
	</AnimatedRoute>
</AuthCheck>
