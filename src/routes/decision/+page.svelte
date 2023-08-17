<script lang="ts">
	import { Collection } from 'sveltefire';
	import { collection, query, where, deleteDoc, doc } from 'firebase/firestore';
	import { user, firestore } from '$lib/firebase';
	import { goto } from '$app/navigation';

	$: decisionsForUserQuery = query(
		collection(firestore, `decisions`),
		where('user', '==', $user?.uid)
	);

	function editDecision(id: string) {
		goto(`/decision/summary?id=${id}`);
	}
	async function deleteDecision(id: string) {
		if (confirm('Are you sure you want to delete this decision?')) {
			await deleteDoc(doc(firestore, 'decisions', id));
		}
	}
</script>

<button class="btn btn-primary mb-4" on:click={() => goto('/decision/summary?id=new')}>
	Create New Decision
</button>

<Collection ref={decisionsForUserQuery} let:data={decisions}>
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
</Collection>
