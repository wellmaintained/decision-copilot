<script lang="ts">
	import { FirebaseApp, SignedIn, SignedOut } from 'sveltefire';
	import '../app.css';
	import { auth, firestore } from '$lib/firebase';
	import { goto } from '$app/navigation';
</script>

<FirebaseApp {auth} {firestore}>
	<div
		class="bg-base-300 text-base-content sticky top-0 z-30 flex h-16 w-full justify-center bg-opacity-90 backdrop-blur transition-shadow duration-100 [transform:translate3d(0,0,0)]
  shadow-md"
	>
		<div class="navbar">
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
				<SignedIn let:user let:signOut>
					<div class="dropdown dropdown-end">
						<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
							<div class="w-10 rounded-full">
								<img alt="Avatar for {user.displayName}" src={user.photoURL} />
							</div>
						</div>
						<ul
							class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-primary rounded-box w-52"
						>
							<li>
								<a href="/" class="justify-between">
									Profile
									<span class="badge">New</span>
								</a>
							</li>
							<li><a href="/">Settings</a></li>
							<li><a href="/" on:click={signOut}>Logout</a></li>
						</ul>
					</div>
				</SignedIn>
				<SignedOut>
					<button class="btn btn-primary" on:click={() => goto('/login')}>Login</button>
				</SignedOut>
			</div>
		</div>
	</div>
	<div class="min-h-screen bg-base-200 p-4">
		<slot />
	</div>
</FirebaseApp>
