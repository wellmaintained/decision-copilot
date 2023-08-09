<script lang="ts">
	import { page } from '$app/stores';
	import AnimatedRoute from '$lib/components/AnimatedRoute.svelte';
	import { user } from '$lib/firebase';
</script>

{#if $user}
	<a href="/login" class="step step-primary">{$user.displayName}</a>
{:else}
	<a href="/login" class="step step-primary">Login</a>
{/if}
<nav class="flex justify-center my-6">
	<ul class="steps">
		<a href="/decision" class="step step-primary">Decision Summary</a>
		<a
			href="/decision/matrix"
			class="step"
			class:step-primary={$page.route.id?.match(/matrix|details|workflow/g)}
		>
			Decision Matrix
		</a>
		<a
			href="/decision/details"
			class="step"
			class:step-primary={$page.route.id?.match(/details|workflow/g)}
		>
			Details
		</a>
		<a
			href="/decision/workflow"
			class="step"
			class:step-primary={$page.route.id?.includes('workflow')}
		>
			Workflow
		</a>
	</ul>
</nav>

<AnimatedRoute>
	<main class="card w-4/6 bg-neutral text-neutral-content mx-auto">
		<div class="card-body items-center text-center">
			<slot />
		</div>
	</main>
</AnimatedRoute>
