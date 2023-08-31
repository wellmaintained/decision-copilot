<script lang="ts">
	import { collectionStore, docStore } from 'sveltefire';
	import { firestore } from '$lib/firebase';
	import { arrayRemove, arrayUnion,
      doc, updateDoc, writeBatch } from 'firebase/firestore';
	import { page } from '$app/stores';
	import type { Decision, User } from '$lib/types';
	import { onMount } from 'svelte';
	import SortableList from "$lib/components/SortableList.svelte";

	const decisionId = $page.params.decisionId;
	const decisionRef = doc(firestore, 'decisions', decisionId);
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
			await updateDoc(decisionRef, {
				stakeholders: arrayUnion(user_id)
			});
		} else {
			await updateDoc(decisionRef, {
				stakeholders: arrayRemove(user_id)
			});
		}
	}
  
	$: decisionOptions = $decisionStore?.options ?? [];

    async function addOption() {
      await updateDoc(decisionRef, {
        options: arrayUnion({
          id: Date.now(),
		  title: '',
        }),
      });
    }

	async function updateOption(option: any, event: Event) {
		const newTitle = (event.target as HTMLInputElement).value;
		if (option.title === newTitle) return;

		option.title = newTitle;
		await updateDoc(decisionRef, {
			options: decisionOptions
		});
		
    }

	async function deleteOption(option: any) {
		await updateDoc(decisionRef, {
			options: arrayRemove(option)
		});
	}

	function sortOptions(e: CustomEvent) {
		const newList = e.detail;
		updateDoc(decisionRef, {
			options: newList
		});
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
		<div class="flex flex-row items-center">
			<span class="text-neutral-content">Options</span>
			<button
				aria-label="Add decision option"
				on:click={(_) => addOption()}
				class="btn btn-ghost btn-sm btn-accent w-min h-min"
				>
				<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="black">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
				</svg>
			</button>
		</div>
		<SortableList list={decisionOptions} on:sort={sortOptions} let:item={option} let:index>
		<label class="input input-bordered flex items-center gap-2">
			<span class="label-text text-neutral-content cursor-move">{index+1}</span>
			<input
				type="text"
				class="grow"
				value={option.title}
				placeholder="Describe the option in a few words"
				on:blur={(event) => updateOption(option, event)}
			/>
			<button class="btn btn-ghost btn-xs" tabindex=-1 on:click={() => deleteOption(option)}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-4 h-4"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
					/>
				</svg>
			</button>
		</label>
		</SortableList>
	</div>
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
