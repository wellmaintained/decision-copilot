<script lang="ts">
	import { docStore } from 'sveltefire';
	import { firestore } from '$lib/firebase';
	import { updateDoc } from 'firebase/firestore';
	import { page } from '$app/stores';

	interface Decision {
		id?: string;
		name?: string;
		description?: string;
		user?: string;
		[x: string]: any; // Allow for any other properties.  TODO - remove this
	}

	let decision: Decision = {};

	const decisionId = $page.url.searchParams.get('id') || 'new';
	const decisionStore = docStore<Decision>(firestore, `decisions/${decisionId}`);

	$: if (decisionStore) {
		decision.id = decisionStore.id;
		decision.name = $decisionStore?.name;
		decision.description = $decisionStore?.description;
		decision.user = $decisionStore?.user;
	}

	async function saveDecision() {
		try {
			if (decisionStore.ref) {
				await updateDoc(decisionStore.ref, decision);
				console.log('Decision saved: ', decision);
			}
		} catch (e) {
			console.error('Error adding decision: ', e);
		}
	}
</script>

<h2>Decision Summary</h2>
ID: {$decisionStore?.id}
Name: {$decisionStore?.name}
Description: {$decisionStore?.description}
<a href="/decision/matrix" class="btn btn-success">Next</a>

<form class="w-2/5" on:submit|preventDefault={saveDecision}>
	<label class="input flex items-center gap-2">
		Name
		<input type="text" class="grow" bind:value={decision.name} />
	</label>
	<label class="input flex items-center gap-2">
		Description
		<input type="text" class="grow" bind:value={decision.description} />
	</label>
	<div class="divider"></div>
</form>
