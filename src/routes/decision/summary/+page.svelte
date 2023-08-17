<script lang="ts">
	import { docStore } from 'sveltefire';
	import { firestore, decisions } from '$lib/firebase';
	import { doc, updateDoc, DocumentReference } from 'firebase/firestore';
	import { page } from '$app/stores';
	import type { Decision } from '$lib/types';

	const decisionId = $page.url.searchParams.get('id') || 'new';
	const decisionRef = doc(decisions, decisionId);
	const decisionStore = docStore<Decision>(firestore, decisionRef);

	async function updateDecisionField(field: string, event: Event) {
		const formElement = event.target as HTMLInputElement;
		const newValue = formElement.value;

		await updateDoc(decisionRef, { [field]: newValue });
		console.log(`${field} updated to:`, newValue);
	}
</script>

<h2>Decision Summary</h2>
<form class="w-2/5" on:submit|preventDefault>
	<label class="input flex items-center gap-2">
		Name
		<input
			type="text"
			class="grow"
			value={$decisionStore?.name}
			on:blur={(event) => updateDecisionField('name', event)}
		/>
	</label>
	<label class="input flex items-center gap-2">
		Description
		<input
			type="text"
			class="grow"
			value={$decisionStore?.description}
			on:blur={(event) => updateDecisionField('description', event)}
		/>
	</label>
	<div class="divider"></div>
	<button class="btn btn-success">Next</button>
</form>
