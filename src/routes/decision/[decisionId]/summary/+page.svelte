<script lang="ts">
	import { collectionStore, docStore } from 'sveltefire';
	import { firestore } from '$lib/firebase';
	import { arrayRemove, arrayUnion,
      doc, updateDoc } from 'firebase/firestore';
	import { page } from '$app/stores';
	import type { Decision, User } from '$lib/types';
	import DecisionOption from '$lib/components/DecisionOption.svelte';
    import { writable } from "svelte/store";
	import { onMount } from 'svelte';

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
		{ id: 'hat', value: 'Hat', explaination: 'Easy & reversable - like chooseing a hat' },
		{ id: 'haircut', value: 'Haircut', explaination: 'A bad decision here will grow out with time' },
		{ id: 'tattoo', value: 'Tattoo', explaination: 'Better think this through carefully!' }
	];

	$: selected_reversibility = $decisionStore?.reversibility;
	$: selected_stakholders = $decisionStore?.stakeholders;

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

    const optionFormDefaults = {
      title: "",
      url: "https://",
    };

    const optionFormData = writable(optionFormDefaults);
  
    let showOptionsForm = false;
  
    $: urlIsValid = $optionFormData.url.match(/^(ftp|http|https):\/\/[^ "]+$/);
    $: titleIsValid = $optionFormData.title.length < 20 && $optionFormData.title.length > 0;
    $: optionFormIsValid = urlIsValid && titleIsValid;

  
    async function addOption(e: SubmitEvent) {
  
      await updateDoc(decisionRef, {
        options: arrayUnion({
          ...$optionFormData,
          id: Date.now().toString(),
        }),
      });
  
      optionFormData.set({
        title: "",
        url: "",
      });
  
      showOptionsForm = false;
    }
  
    function cancelOption() {
      optionFormData.set(optionFormDefaults);
      showOptionsForm = false;
    }

	onMount(async () => {
		const easyMDE_module = await import('easymde');
		const element = document.getElementById('decision_description') as HTMLTextAreaElement;
		const easyMDE = new easyMDE_module.default({
			element: element,
			sideBySideFullscreen: false,
		});
		decisionStore.subscribe((decision) => {
			easyMDE.value(decision?.description || '');
		})
		easyMDE.codemirror.on("blur", () => {
			updateDoc(decisionStore.ref!, { description: easyMDE.value() });
		});
	});

</script>

<h2 class="card-title">Decision Summary</h2>
<em class="text-neutral-content">Enter the basics of the decision below</em>
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
	<label class="input input-bordered flex items-center gap-2">
		<span class="label-text text-neutral-content">Like choosing a &nbsp;</span>
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
	</label>
	<div class="flex flex-col gap-2">
		<div class="text-neutral-content">Stakeholders</div>
		<div class="form-control w-max">
		{#each $usersStore ?? [] as stakeholder}
			<label class="label cursor-pointer flex flex-row gap-2 w-max">
				<input type="checkbox" class="checkbox" 
					value={stakeholder.id}
					checked={$decisionStore?.stakeholders?.includes(stakeholder.id)}
					on:change={(event) => changeStakeholder(event)}
				/>
				<div class="flex flex-row items-center gap-2">
					<div class="w-6 h-6 rounded-full overflow-hidden">
						<img alt="Avatar for {stakeholder.displayName}" src={stakeholder.photoURL.toString()} />
					</div>
					<div class="label-text">{stakeholder.displayName}</div>
				</div> 
			</label>
		{/each}
		</div>
	</div>
	<div class="flex flex-col gap-2">
		<div class="text-neutral-content">Options</div>
		<ol class="list-inside list-decimal">
		{#each $decisionStore?.options ?? [] as option}
			<li><DecisionOption title={option.title} /></li>
		{/each}
		</ol>
		{#if showOptionsForm}
        <form
          on:submit|preventDefault={addOption}
          class="bg-base-200 p-6 w-full mx-auto rounded-xl"
        >
          <input
            name="title"
            type="text"
            placeholder="Title"
            class="input input-sm"
            bind:value={$optionFormData.title}
          />
          <input
            name="url"
            type="text"
            placeholder="URL"
            class="input input-sm"
            bind:value={$optionFormData.url}
          />
          <div class="my-4">
            {#if !titleIsValid}
              <p class="text-error text-xs">Must have valid title</p>
            {/if}
            {#if !urlIsValid}
              <p class="text-error text-xs">Must have a valid URL</p>
            {/if}
           </div>
          <button
            disabled={!optionFormIsValid}
            type="submit"
            class="btn btn-success">Add</button
          >
          <button type="button" class="btn btn-xs my-4" on:click={cancelOption}>Cancel</button>
        </form>
      {:else}
        <button
		  aria-label="Add decision option"
          on:click={() => (showOptionsForm = true)}
          class="btn btn-ghost btn-sm btn-accent w-min"
        >
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
			</svg>
        </button>
      {/if}
	</div>
	<div class="divider"></div>
	<a class="btn btn-primary" href="/decision/{decisionStore?.id}/matrix">Next</a>
</div>
