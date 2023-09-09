<script lang="ts">
	import { getContext } from 'svelte';
	import type { User } from '$lib/types';
	import { collectionStore } from 'sveltefire';
	import { firestore } from '$lib/firebase';
	import type { DecisionRepo } from '$lib/decisionRepo';
	import { fade } from 'svelte/transition';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
  	import RadioButtonOptions from '$lib/components/RadioButtonOptions.svelte';

	const decisionRepo = getContext<DecisionRepo>('decisionRepo');
	const decisionData = decisionRepo.latestDecisionData;
	const stakeholdersStore = collectionStore<User>(firestore, 'stakeholders');


	function isDecisionStakeholder(stakeholder_id: string): boolean {
		if (!$decisionData?.stakeholders) return false;
		if ($decisionData.stakeholders.length === 0) return false;
		if ($decisionData.stakeholders?.findIndex((s) => s.stakeholder_id === stakeholder_id) > -1) {
			return true;
		}
		return false
	}
</script>

{#if $decisionData}
	<h2 class="card-title">Identify the Decision</h2>
	<em class="text-neutral-content">Capture information about the decision being made and who is involved</em>
	<div class="flex flex-col gap-4 text-base-content">
		<label class="input input-bordered flex items-center gap-2">
			<span class="label-text text-neutral-content">Title</span>
			<input
				type="text"
				class="grow"
				value={$decisionData.title || ''}
				placeholder="How you would describe what this decision is about in a few words"
				on:blur={(event) => decisionRepo.updateDecisionField('title', event.target?.value)}
			/>
		</label>
		<div class="flex flex-col gap-2">
			<div class="text-neutral-content">Details</div>
			<MarkdownEditor 
				value={$decisionData.description} 
				on:blur={decisionRepo.handleDescriptionUpdate} 
			/>
		</div>
		<div class="flex flex-col gap-2">
			<div class="text-neutral-content">Cost - <em>how much will it cost (in effort, time or money) to implement?</em></div>
			<div class="input input-bordered h-max">
				<RadioButtonOptions 
					options={[
						{key: 'low', label: 'Low', explaination: 'Quick, cheap and easy to implement' },
						{key: 'medium', label: 'Medium', explaination: 'A bit of on-off work' },
						{key: 'high', label: 'High', explaination: 'Difficult to implement; lots of knock on effects and/or repeated effort' }
					]}
					selected={$decisionData?.cost} 
					on:changeOption={(event) => decisionRepo.updateDecisionField('cost', event.detail)}>
				</RadioButtonOptions>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<div class="text-neutral-content">Reversibility - <em>like choosing a</em></div>
			<div class="input input-bordered h-max">
				<RadioButtonOptions 
					options={[
						{ key: 'hat', label: 'Hat', explaination: 'Easy & reversable - like choosing a hat' },
						{ key: 'haircut', label: 'Haircut', explaination: 'A bad decision here will grow out with time' },
						{ key: 'tattoo', label: 'Tattoo', explaination: 'Better think this through carefully!' }
					]} 
					selected={$decisionData?.reversibility}
					on:changeOption={(event) => decisionRepo.updateDecisionField('reversibility', event.detail)}>
				</RadioButtonOptions>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<div class="text-neutral-content">Stakeholders - <em>who has an interest in - or is impacted by - this decision?</em></div>
			<div class="input input-bordered h-max">
				<div class="flex flex-row gap-2 flex-wrap">
					{#each $stakeholdersStore ?? [] as stakeholder (stakeholder.id)}
						<label class="label cursor-pointer flex flex-row gap-2 w-max" transition:fade>
							<input type="checkbox" class="checkbox" 
								value={stakeholder.id}
								checked={isDecisionStakeholder(stakeholder.id)}
								on:change={(event) => decisionRepo.changeStakeholder(event)}
							/>
							<div class="flex flex-row items-center gap-2">
								<div class="avatar w-8 h-8 rounded-full overflow-hidden border-base-300 border">
									<img alt="Avatar for {stakeholder.displayName}" src={stakeholder.photoURL.toString()} />
								</div>
								<div class="label-text w-14">{stakeholder.displayName}</div>
							</div> 
						</label>
					{:else}
            			<span class="loading loading-dots loading-md"></span>
					{/each}
				</div>
			</div>
		</div>
		<a class="btn btn-primary w-1/4 ml-auto mr-2" href="/decision/{decisionRepo.decisionId}/process">Next</a>
	</div>
{:else}
	<span class="loading loading-dots loading-md"></span>
{/if}