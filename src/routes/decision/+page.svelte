<script lang="ts">
	import { Collection } from 'sveltefire';
	import { collection, query, where, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
	import { user, firestore, decisions } from '$lib/firebase';
	import { goto } from '$app/navigation';

	$: decisionsForUserQuery = query(
		collection(firestore, `decisions`),
		where('user', '==', $user?.uid)
	);

	async function createDecision() {
		const decisionRef = await addDoc(decisions, {
			name: 'New Decision',
			description: 'TODO: Add decision description here.',
			user: $user!.uid
		});
		// Update the decision with its own ID
		await updateDoc(decisionRef, { id: decisionRef.id });
		goto(`/decision/${decisionRef.id}/summary`);
	}
	async function deleteDecision(id: string) {
		if (confirm('Are you sure you want to delete this decision?')) {
			await deleteDoc(doc(firestore, 'decisions', id));
			console.log('Decision deleted:', id);
		}
	}
</script>

<button class="btn btn-primary mb-4" on:click={createDecision}> Create New Decision </button>

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
							<button
								class="btn btn-ghost btn-sm btn-accent"
								aria-label="Edit decision"
								on:click={() => goto(`/decision/${decision.id}/summary`)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-6 h-6"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
									/>
								</svg>
							</button>
							<button class="btn btn-ghost btn-sm" on:click={() => deleteDecision(decision.id)}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-6 h-6"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
									/>
								</svg>
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
