<script lang="ts">
	import '../app.css';
	import { auth, user } from '$lib/firebase';
	import { signOut } from 'firebase/auth';
	import { goto } from '$app/navigation';
</script>

<div class="navbar bg-base-200 text-primary-content shadow-md">
	<div class="navbar-start">
		<a class="btn btn-ghost text-xl" href="/">Decision Copilot</a>
	</div>
	<div class="navbar-center">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/decision">Decisions</a></li>
			<li>
				<details>
					<summary>Parent</summary>
					<ul class="p-2 bg-primary rounded-t-none">
						<li><a href="/">Link 1</a></li>
						<li><a href="/">Link 2</a></li>
					</ul>
				</details>
			</li>
		</ul>
	</div>
	<div class="navbar-end">
		{#if $user}
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
					<div class="w-10 rounded-full">
						<img alt="Avatar for {$user.displayName}" src={$user.photoURL} />
					</div>
				</div>
				<ul class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-primary rounded-box w-52">
					<li>
						<a href="/" class="justify-between">
							Profile
							<span class="badge">New</span>
						</a>
					</li>
					<li><a href="/">Settings</a></li>
					<li><a href="/" on:click={() => signOut(auth)}>Logout</a></li>
				</ul>
			</div>
		{:else}
			<button class="btn btn-secondary" on:click={() => goto('/login')}>Login</button>
		{/if}
	</div>
</div>

<div class="min-h-screen flex flex-col">
	<slot />
</div>
