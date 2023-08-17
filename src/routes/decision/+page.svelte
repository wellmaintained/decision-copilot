<script lang="ts">
	import { onMount } from 'svelte';
	import { db } from '$lib/firebase';
	import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
	import { user } from '$lib/firebase';
	import { goto } from '$app/navigation';

	let decisions: any[] = [];

	onMount(async () => {
		const q = query(collection(db, 'decisions'), where('user', '==', $user?.uid));
		const querySnapshot = await getDocs(q);
		decisions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	});

	function editDecision(id: string) {
		goto(`/decision/summary?id=${id}`);
	}
	async function deleteDecision(id: string) {
		if (confirm('Are you sure you want to delete this decision?')) {
			await deleteDoc(doc(db, 'decisions', id));
			decisions = decisions.filter((decision) => decision.id !== id);
		}
	}
</script>

<button class="btn btn-primary mb-4" on:click={() => goto('/decision/summary?id=new')}>
	Create New Decision
</button>

{#if $user}
	{#if decisions.length > 0}
		<table class="table w-full">
			<thead>
				<tr>
					<th>Name</th>
					<th>Description</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each decisions as decision}
					<tr>
						<td>{decision.name}</td>
						<td>{decision.description}</td>
						<td>
							<button class="btn btn-xs btn-accent" on:click={() => editDecision(decision.id)}>
								Edit
							</button>
							<button
								class="btn btn-xs btn-error ml-2"
								on:click={() => deleteDecision(decision.id)}
							>
								Delete
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>No decisions found.</p>
	{/if}
{/if}
