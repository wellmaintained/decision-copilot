<script lang="ts">
	import { SignedIn, SignedOut } from 'sveltefire';
</script>

<SignedIn>
	<slot />
</SignedIn>

<SignedOut>
	<div class="card w-96 bg-base-100 shadow-xl">
		<div class="card-body items-center text-center">
			<p class="text-error">You must be logged in to view this page</p>
		</div>
	</div>
</SignedOut>
