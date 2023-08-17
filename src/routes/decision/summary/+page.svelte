<script lang="ts">
	import { docStore } from 'sveltefire';
	import { firestore, decisions } from '$lib/firebase';
	import { doc, updateDoc } from 'firebase/firestore';
	import { page } from '$app/stores';
	import type { Decision } from '$lib/types';

	const decisionId = $page.url.searchParams.get('id') || 'new';
	const decisionRef = doc(decisions, decisionId);
	const decisionStore = docStore<Decision>(firestore, decisionRef);

	async function updateName(event: Event) {
		const formElement = event.target as HTMLInputElement;
		const newValue = formElement.value;
		await updateDoc(decisionRef, {
			name: newValue
		});
		console.log('Name updated to:', newValue);
	}

	async function updateDescription(event: Event) {
		const formElement = event.target as HTMLInputElement;
		const newValue = formElement.value;
		await updateDoc(decisionRef, {
			description: newValue
		});
		console.log('Description updated to:', newValue);
	}
</script>

<h2>Decision Summary</h2>
<form class="w-2/5" on:submit|preventDefault>
	<label class="input flex items-center gap-2">
		Name
		<input type="text" class="grow" value={$decisionStore?.name} on:blur={updateName} />
	</label>
	<label class="input flex items-center gap-2">
		Description
		<input
			type="text"
			class="grow"
			value={$decisionStore?.description}
			on:blur={updateDescription}
		/>
	</label>
	<div class="divider"></div>
	<button class="btn btn-success">Next</button>
</form>
