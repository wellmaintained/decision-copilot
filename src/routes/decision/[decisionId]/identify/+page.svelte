<script lang="ts">
	import { collectionStore, docStore } from 'sveltefire';
	import { firestore } from '$lib/firebase';
	import { arrayRemove, arrayUnion,
      doc, updateDoc } from 'firebase/firestore';
	import { page } from '$app/stores';
	import type { Decision, User } from '$lib/types';
	import { onMount } from 'svelte';

	import DecisionCriteria from '$lib/components/DecisionCriteria.svelte';

	const decisionId = $page.params.decisionId;
	const decisionStore = docStore<Decision>(firestore, `decisions/${decisionId}`);
	const usersStore = collectionStore<User>(firestore, 'users');

	async function updateDecisionField(field: string, event: Event) {
		const formElement = event.target as HTMLInputElement;
		const newValue = formElement.value;
		await updateDoc(decisionStore.ref!, { [field]: newValue });
	}

	const reversibility_options = [
		{ id: 'hat', value: 'Hat', explaination: 'Easy & reversable - like choosing a hat' },
		{ id: 'haircut', value: 'Haircut', explaination: 'A bad decision here will grow out with time' },
		{ id: 'tattoo', value: 'Tattoo', explaination: 'Better think this through carefully!' }
	];

	$: selected_reversibility = $decisionStore?.reversibility;

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
  
  	onMount(async () => {
		const element = document.getElementById('decision_description') as HTMLTextAreaElement;
		if (element.nextElementSibling==null) {
			const easyMDE_module = await import('easymde');
			// config instructions: https://github.com/Ionaru/easy-markdown-editor?tab=readme-ov-file#configuration
			const easyMDE = new easyMDE_module.default({
				element: element,
				sideBySideFullscreen: false,
				spellChecker: false,
				status: false,
				minHeight: '200px',
			});
			decisionStore.subscribe((decision) => {
				easyMDE.value(decision?.description || '');
			})
			easyMDE.codemirror.on("blur", () => {
				updateDoc(decisionStore.ref!, { description: easyMDE.value() });
			});
		} else {
			console.log('EasyMDE already initialized for', element);
		}
	});

</script>

<h2 class="card-title">Identify the Decision</h2>
<em class="text-neutral-content">Capture information about the decision being made and who is involved</em>
<div class="flex flex-col gap-4 text-base-content">
	<label class="input input-bordered flex items-center gap-2">
		<span class="label-text text-neutral-content">Title</span>
		<input
			type="text"
			class="grow"
			value={$decisionStore?.title || ''}
			placeholder="How you would describe what this decision is about in a few words"
			on:blur={(event) => updateDecisionField('title', event)}
		/>
	</label>
	<label class="form-control">
		<div class="label">
			<span class="label-text text-neutral-content">Details</span>
		</div>
		<textarea
			id="decision_description"
		></textarea>
	</label>
	<div class="flex flex-col gap-2">
		<div class="text-neutral-content">Reversibility - <em>like choosing a</em></div>
		<div class="input input-bordered h-max">
		{#each reversibility_options as option}
			<div class="tooltip" data-tip="{option.explaination}">
				<label class="label cursor-pointer tooltop">
					<input
						type="radio"
						class="radio"
						name="reversibility"
						value={option.id}
						bind:group={selected_reversibility}
						on:change={(event) => updateDecisionField('reversibility', event)}
					/>
					<span class="label-text pl-1">{option.value}</span>
				</label>
			</div>
		{/each}
		</div>
	</div>
	<DecisionCriteria {decisionStore}/>
	<div class="flex flex-col gap-2">
		<div class="text-neutral-content">Stakeholders - <em>who has an interest in - or is impacted by - this decision?</em></div>
		<div class="input input-bordered h-max">
			<div class="grid grid-cols-3 gap-2">
				{#each $usersStore ?? [] as stakeholder}
					<label class="label cursor-pointer flex flex-row gap-2 w-max">
						<input type="checkbox" class="checkbox" 
							value={stakeholder.id}
							checked={$decisionStore?.stakeholders?.includes(stakeholder.id)}
							on:change={(event) => changeStakeholder(event)}
						/>
						<div class="flex flex-row items-center gap-2">
							<div class="w-8 h-8 rounded-full overflow-hidden">
								<img alt="Avatar for {stakeholder.displayName}" src={stakeholder.photoURL.toString()} />
							</div>
							<div class="label-text">{stakeholder.displayName}</div>
						</div> 
					</label>
				{/each}
			</div>
		</div>
	</div>
	<div class="divider"></div>
	<a class="btn btn-primary" href="/decision/{decisionStore?.id}/matrix">Next</a>
</div>
