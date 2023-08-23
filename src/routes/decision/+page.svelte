<script lang="ts">
	import { collectionStore } from 'sveltefire';
	import {
		collection,
		query,
		where,
		deleteDoc,
		doc,
		addDoc,
		updateDoc,
		limit,
		getDocs,
		orderBy
	} from 'firebase/firestore';
	import { user, firestore } from '$lib/firebase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	async function createDecision() {
		const decisionRef = await addDoc(collection(firestore, `decisions`), {
			project_id: currentProjectId,
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

	function getDecisionsForProject(projectId: string) {
		return collectionStore(firestore, query(
			collection(firestore, 'decisions'),
			where('project_id', '==', projectId)
		));
	}
	let	currentProjectId = 'unknown';
	let decisionsForProject = getDecisionsForProject(currentProjectId);

	let projects = collectionStore(firestore, query(
		collection(firestore, `projects`), 
		orderBy('name')
	));

	function changeSelectedProject (event: any) {
		currentProjectId = event.target.value;
		decisionsForProject = getDecisionsForProject(currentProjectId);
	}

	onMount(async () => {
		const projectsSnapshot = await getDocs(
			query(collection(firestore, `projects`), orderBy('name'), limit(1))
		);
		projectsSnapshot.forEach((project) => {
			currentProjectId = project.id;
		});
		decisionsForProject = getDecisionsForProject(currentProjectId);
	});
</script>

<div class="flex flex-row">
	<div class="basis-3/4">
		<select
			class="select select-bordered w-full max-w-xs"
			bind:value={currentProjectId}
			on:change={changeSelectedProject}
		>
		{#each $projects as project}
			<option value={project.id}>{project.name}</option>
		{/each}
		</select>
	</div>
	<div class="basis-1/4">
		<button class="btn btn-primary mb-4" on:click={createDecision}> Create New Decision </button>
	</div>
</div>

{#if $decisionsForProject.length > 0}
	<table class="table w-full">
		<thead>
			<tr>
				<th style="width: 70%;">Decision</th>
				<th style="width: 30%;">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each $decisionsForProject as decision}
				<tr>
					<td>
						<h2 class="font-semibold">{decision.title}</h2>
						<p>{decision.description}</p>
					</td>
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
