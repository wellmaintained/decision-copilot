<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth, authenticatedUser } from '$lib/firebase';
	import type { FirebaseError } from 'firebase/app';
	import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
	
	let signInError:FirebaseError | null = null;

	async function signInWithGoogle() {
		try {
			const provider = new GoogleAuthProvider();
			await signInWithPopup(auth, provider);
			signInError = null;
			goto('/decision');
		} catch (error) {
			console.error('Error during sign-in:', error);
			signInError = error as FirebaseError
		}
	}	
</script>

<main class="card w-4/6 bg-base-100 text-base-content mx-auto">
	<div class="card-body items-center text-center">
		<h2>Login</h2>
		{#if signInError}
			<div role="alert" class="alert alert-error">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
				</svg>
				<span>Error during login: {signInError.message}</span>
			</div>
		{/if}
		{#if $authenticatedUser}
			<h2 class="card-title">Welcome, {$authenticatedUser.displayName}</h2>
			<p class="text-center text-success">You are logged in</p>
			<button class="btn btn-primary" on:click={() => signOut(auth)}>Sign out</button>
		{:else}
			<button class="btn btn-primary" on:click={signInWithGoogle}>Sign in with Google</button>
		{/if}
	</div>
</main>
