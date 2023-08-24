<script lang="ts">
	import { docStore } from 'sveltefire';
	import { firestore } from '$lib/firebase';
	import { arrayRemove,
      arrayUnion,
      setDoc, doc, updateDoc } from 'firebase/firestore';
	import { page } from '$app/stores';
	import type { Decision } from '$lib/types';
	import DecisionOption from '$lib/components/DecisionOption.svelte';
    import { writable } from "svelte/store";

	const decisionId = $page.params.decisionId;
	const decisionRef = doc(firestore, 'decisions', decisionId);
	const decisionStore = docStore<Decision>(firestore, `decisions/${decisionId}`);

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
 
    // async function deleteLink(item: any) {
    //   const userRef = doc(db, "users", $user!.uid);
    //   await updateDoc(userRef, {
    //     links: arrayRemove(item),
    //   });
    // }
  
    function cancelOption() {
      optionFormData.set(optionFormDefaults);
      showOptionsForm = false;
    }
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
			class="textarea textarea-bordered h-24"
			value={$decisionStore?.description || ''}
			placeholder="Explain the decision being made in more detail"
			on:blur={(event) => updateDecisionField('description', event)}
		></textarea>
	</label>
	<p>Stakeholders</p>
	<div class="flex flex-row gap-2">
		<div class="text-neutral-content">Options</div>
		<ol class="list-decimal">
		{#each $decisionStore?.options ?? [] as option}
			<li><DecisionOption title={option.title} /></li>
		{/each}
		</ol>
		<div class="">
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
          on:click={() => (showOptionsForm = true)}
          class="btn btn-outline btn-info block mx-auto my-4"
        >
          Add an Option
        </button>
      {/if}
	  </div>
	</div>
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
	<div class="divider"></div>
	<a class="btn btn-primary" href="/decision/{decisionStore?.id}/matrix">Next</a>
</div>
