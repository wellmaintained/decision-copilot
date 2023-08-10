<script lang="ts">
	import { user } from '$lib/firebase';
</script>

{#if $user}
	<slot />
{:else}
	<div class="card w-96 bg-base-100 shadow-xl">
		<div class="card-body items-center text-center">
			<p class="text-error">You must be logged in to view this page</p>
			<div class="card-actions">
				<a class="btn btn-primary" href="/login">Login</a>
			</div>
		</div>
	</div>
{/if}
