<script lang="ts">
	import { FirebaseApp, SignedIn, SignedOut } from 'sveltefire';
	import '../app.css';
	import { auth, firestore } from '$lib/firebase';
	import { goto } from '$app/navigation';
</script>

<FirebaseApp {auth} {firestore}>
<div class="bg-base-200">
	<div class="bg-base-300 text-base-content mb-0.5 shadow shadow-gray-400">
		<div class="navbar">
			<div class="navbar-start">
				<div class="flex-none lg:hidden">
					<label for="menu-drawer" aria-label="open sidebar menu" class="btn btn-square btn-ghost">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
						</svg>
					</label>
				</div> 
				<a class="btn btn-ghost text-xl" href="/">Decision Copilot</a>
			</div>
			<div class="navbar-end">
				<SignedIn let:user let:signOut>
					<div class="dropdown dropdown-end">
						<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar border-base-300 border">
							<div class="w-10 rounded-full">
								<img alt="Avatar for {user.displayName}" src={user.photoURL} />
							</div>
						</div>
						<ul
							class="z-[1] p-2 shadow menu menu-sm dropdown-content w-52 bg-base-300"
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
	<div class="drawer lg:drawer-open">
  		<input id="menu-drawer" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content min-h-screen p-4">
			<slot />
		</div>
		<div class="drawer-side">
			<label for="menu-drawer" aria-label="close sidebar" class="drawer-overlay"></label> 
			<ul class="menu p-4 pr-8 w-max min-h-full bg-base-300 text-base-content">
				<li><a href="/decision">Decisions</a></li>
			</ul>
		</div>
	</div>
</div>
</FirebaseApp>
