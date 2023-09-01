<script lang="ts">
	import { getContext } from 'svelte';
	import type { Decision, User } from '$lib/types';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import { collectionStore, docStore } from 'sveltefire';
	import { firestore } from '$lib/firebase';
	import type { DecisionRepo } from '$lib/decisionRepo';

	const decisionRepo = getContext('decisionRepo') as DecisionRepo;
    const decisionData = docStore<Decision>(firestore, `decisions/${decisionRepo.decisionId}`);
	const stakeholdersStore = collectionStore<User>(firestore, 'stakeholders');

	const reversibility_options = [
		{ id: 'hat', value: 'Hat', explaination: 'Easy & reversable - like choosing a hat' },
		{ id: 'haircut', value: 'Haircut', explaination: 'A bad decision here will grow out with time' },
		{ id: 'tattoo', value: 'Tattoo', explaination: 'Better think this through carefully!' }
	];
	$: reversibility = $decisionData?.reversibility;

</script>

<h2 class="card-title">Identify the Decision</h2>
<em class="text-neutral-content">Capture information about the decision being made and who is involved</em>
<div class="flex flex-col gap-4 text-base-content">
	<label class="input input-bordered flex items-center gap-2">
		<span class="label-text text-neutral-content">Title</span>
		<input
			type="text"
			class="grow"
			value={$decisionData?.title || ''}
			placeholder="How you would describe what this decision is about in a few words"
			on:blur={(event) => decisionRepo.updateDecisionField('title', event)}
		/>
	</label>
	<div class="flex flex-col gap-2">
		<div class="text-neutral-content">Details</div>
		<MarkdownEditor 
			value={$decisionData?.description} 
			on:blur={decisionRepo.handleDescriptionUpdate} 
		/>
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
						bind:group={reversibility}
						value={option.id}
						on:change={(event) => decisionRepo.updateDecisionField('reversibility', event)}
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
				{#each $stakeholdersStore ?? [] as stakeholder}
					<label class="label cursor-pointer flex flex-row gap-2 w-max">
						<input type="checkbox" class="checkbox" 
							value={stakeholder.id}
							checked={$decisionData?.stakeholders?.includes(stakeholder.id)}
							on:change={(event) => decisionRepo.changeStakeholder(event)}
						/>
						<div class="flex flex-row items-center gap-2">
							<div class="avatar w-8 h-8 rounded-full overflow-hidden border-base-300 border">
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
	<a class="btn btn-primary" href="/decision/{decisionRepo.decisionId}/process">Next</a>
</div>
