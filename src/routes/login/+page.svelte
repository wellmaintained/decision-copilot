<script lang="ts">
	import { auth, authenticatedUser } from '$lib/firebase';
	import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
	
	async function signInWithGoogle() {
		try {
			const provider = new GoogleAuthProvider();
			await signInWithPopup(auth, provider);
			// Handle additional logic if beforeUserCreated function exists and returns an error
			// This is a placeholder for the actual error handling logic
			// Replace with your actual error handling code
		} catch (error) {
			console.error('Error during sign-in:', error);
			// Display an error message to the user or handle the error as needed
		}
	}	
</script>

<main class="card w-4/6 bg-base-100 text-base-content mx-auto">
	<div class="card-body items-center text-center">
		<h2>Login</h2>

		{#if $authenticatedUser}
			<h2 class="card-title">Welcome, {$authenticatedUser.displayName}</h2>
			<p class="text-center text-success">You are logged in</p>
			<button class="btn btn-primary" on:click={() => signOut(auth)}>Sign out</button>
		{:else}
			<button class="btn btn-primary" on:click={signInWithGoogle}>Sign in with Google</button>
		{/if}
	</div>
</main>
