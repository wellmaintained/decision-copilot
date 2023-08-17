<script lang="ts">
	import { docStore } from 'sveltefire';
	import { firestore, decisions } from '$lib/firebase';
	import { doc, updateDoc } from 'firebase/firestore';
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
<div class="flex flex-col gap-4 text-base-content">
	<label class="input input-bordered flex items-center gap-2">
		<span class="label-text text-neutral-content">Name</span>
		<input
			type="text"
			class="grow"
			value={$decisionStore?.name}
			on:blur={(event) => updateDecisionField('name', event)}
		/>
	</label>
	<label class="form-control">
		<div class="label">
			<span class="label-text text-neutral-content">Details</span>
		</div>
		<textarea
			class="textarea textarea-bordered h-24"
			value={$decisionStore?.description}
			on:blur={(event) => updateDecisionField('description', event)}
		></textarea>
	</label>
	<div class="divider"></div>
	<button class="btn btn-primary">Next</button>
</div>
