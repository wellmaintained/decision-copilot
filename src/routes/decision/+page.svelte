<script lang="ts">
	import { onMount } from 'svelte';
	import { db } from '$lib/firebase';
	import { collection, query, where, getDocs } from 'firebase/firestore';
	import { user } from '$lib/firebase';

	let decisions: any[] = [];

	onMount(async () => {
		const q = query(collection(db, 'decisions'), where('user', '==', $user?.uid));
		const querySnapshot = await getDocs(q);
		decisions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	});
</script>

<h1>Decision list</h1>
<button class="btn btn-primary mb-4" on:click={() => goto('/decision/new')}>Create New Decision</button>

{#if $user}
	{#if decisions.length > 0}
		<table class="table w-full">
			<thead>
				<tr>
					<th>Name</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				{#each decisions as decision}
					<tr>
						<td>{decision.name}</td>
						<td>{decision.description}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>No decisions found.</p>
	{/if}
{/if}
