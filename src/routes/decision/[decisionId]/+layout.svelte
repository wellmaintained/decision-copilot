<script lang="ts">
	import { page } from '$app/stores';
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import { firestore } from '$lib/firebase';
	import type { Decision, DecisionContext } from '$lib/types';
	import { arrayRemove, arrayUnion, serverTimestamp, updateDoc } from "firebase/firestore";
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { docStore } from 'sveltefire';

	const decisionId = $page.params.decisionId;
	const decisionStore = docStore<Decision>(firestore, `decisions/${decisionId}`);

	async function updateDecisionField(field: string, event: Event) {
		const formElement = event.target as HTMLInputElement;
		const newValue = formElement.value;
		await updateDoc(decisionStore.ref!, {
			[field]: newValue,
			updatedAt: serverTimestamp()
		});
	}
	async function changeStakeholder(event: Event) {
		const user_id = (event.target as HTMLInputElement).value;
		const isChecked = (event.target as HTMLInputElement).checked;
		if (isChecked) {
			await updateDoc(decisionStore.ref!, {
				stakeholders: arrayUnion(user_id)
			});
		} else {
			await updateDoc(decisionStore.ref!, {
				stakeholders: arrayRemove(user_id)
			});
		}
	}
	function handleDescriptionUpdate(e: CustomEvent) {
		const newDescription = e.detail;
		updateDoc(decisionStore.ref!, {
			description: newDescription
		});
    }	
	function handleDecisionUpdate(e: CustomEvent) {
		const newDecision = e.detail;
		updateDoc(decisionStore.ref!, {
			decision: newDecision
		});
    }
	
	const decisionData = writable<Decision>();
	$: decisionData.set({...$decisionStore!});
	const decisionContext: DecisionContext = {
		subscribe: decisionData.subscribe,
		decisionId: decisionId,
		updateDecisionField: updateDecisionField,
		changeStakeholder: changeStakeholder,
		handleDescriptionUpdate: handleDescriptionUpdate,
		handleDecisionUpdate: handleDecisionUpdate
	}
	setContext('decisionContext', decisionContext);

</script>

<AuthCheck>
	{#if decisionId}
		<div role="tablist" class="tabs tabs-lifted">
			<a  role="tab"
				href="/decision/{decisionId}/identify"
				class="tab h-10"
				class:tab-active={$page.route.id?.includes('identify')}
			>
				Identify
			</a>
			<a  role="tab"
				href="/decision/{decisionId}/process"
				class="tab h-10"
				class:tab-active={$page.route.id?.includes('process')}
			>
				Process
			</a>
			<a  role="tab"
				href="/decision/{decisionId}/decide"
				class="tab h-10"
				class:tab-active={$page.route.id?.includes('decide')}
			>
				Decide
			</a>
			<a  role="tab"
				href="/decision/{decisionId}/view"
				class="tab h-10"
				class:tab-active={$page.route.id?.includes('view')}
			>
				View
			</a>
		</div>				
	{/if}

	<div role="tabpanel" class="p-4 bg-base-100 border-base-300 border-l border-b border-r">
		<slot />
	</div>
</AuthCheck>
