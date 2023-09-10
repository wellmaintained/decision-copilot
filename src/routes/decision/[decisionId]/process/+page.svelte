<script lang="ts">
    import { getContext } from 'svelte';
	import type { DecisionRepo } from '$lib/decisionRepo';
	import RadioButtonOptions from '$lib/components/RadioButtonOptions.svelte';
	import { writable } from 'svelte/store';
	import type { Stakeholder } from '$lib/types';
	import StakeholderAvatar from '$lib/components/StakeholderAvatar.svelte';
	
	const decisionRepo = getContext<DecisionRepo>('decisionRepo');
	const decisionData = decisionRepo.latestDecisionData;
    let involvedStakeholders = writable([] as Stakeholder[]);
    let roleAssignmentErrors:string[] = [];
    let availableDecisionMethods:string[] = [];

    decisionData.subscribe(async (d) => {
        if (d?.stakeholders && d.stakeholders.length>0) {
            involvedStakeholders.set(await decisionRepo.fetchDecisionStakeholderData(d.stakeholders));               
            roleAssignmentErrors = [];
            availableDecisionMethods = [];
            if ($decisionData?.stakeholders && $decisionData?.stakeholders.length>0) {
                const deciders = d.stakeholders.filter((s) => s.role === 'decider');
                if (deciders.length === 0) {
                    roleAssignmentErrors.push("At least 1 stakeholder must be assigned the Decider role");
                    d.decisionMethod = 'unknown';
                    return;
                } else if (deciders.length === 1) {
                    availableDecisionMethods.push("autocratic");
                } else {
                    availableDecisionMethods.push("democratic")
                }
                const advisors = d.stakeholders.filter((s) => s.role === 'advisor');
                if (advisors.length > 0 ) {
                    availableDecisionMethods.push("consent")
                }
            }
        }
    });

	function handleStakeholderRoleChange(stakeholder_id: string, role: string): void {
        decisionRepo.updateStakeholderRole(stakeholder_id, role);
	}

    async function handleDecisionMethodSelect(decisionMethod: string): Promise<void> {
		await decisionRepo.updateDecisionField('decisionMethod', decisionMethod);
	}

    const decisionMethods = {
        unknown: {
            title: "Unknown",
            description: "Please assign roles to stakeholders first",
            speed: 0,
            buyIn: 0
        },
        autocratic: {
            title: "Autocratic",
            description: "The person driving the process makes a decision and informs all stakeholders",
            speed: 4,
            buyIn: 0
        },
        democratic: {
            title: "Democratic",
            description: "Option with the most votes wins",
            speed: 0,
            buyIn: 4
        },
        consent: {
            title: "Consent",
            description: "The proposal is selected if no one has a strong/reasoned objection",
            speed: 3,
            buyIn: 3
        }
    }         
    $: selectedDecisionMethod = decisionMethods[$decisionData?.decisionMethod || 'unknown'];
</script>

<div class="join join-vertical w-full">
    <div class="join-item border border-base-300 p-4">
        <h2 class="text-xl font-medium mb-2">
            Assign roles
        </h2>
        <div class="flex flex-col gap-2">
            <div class="input input-bordered h-max">
                {#each $involvedStakeholders as stakeholder, index (stakeholder.id)}
                    <div class="flex flex-row flex-wrap pt-3 align-middle" class:border-t={ index > 0 }>
                        <div class="flex-initial w-1/4">
                            <StakeholderAvatar {stakeholder} />
                        </div>
                        <div class="flex-auto">
                            <RadioButtonOptions 
                                    options={[
                                        {key: "decider", label: "Decider", explaination: "The person making the decision"},
                                        {key: "advisor", label: "Advisor", explaination: "The person providing advice"},
                                        {key: "observer", label: "Observer", explaination: "The person being informed"}
                                    ]}
                                    selected={$decisionData?.stakeholders?.find((s) => s.stakeholder_id === stakeholder.id)?.role}
                                    on:changeOption={(e) => handleStakeholderRoleChange(stakeholder.id, e.detail)}
                                />
                        </div>
                    </div>
                {:else}
                    <div class="loading loading-dots loading-md"></div>
                {/each}
                {#if roleAssignmentErrors.length > 0}
                    <div role="alert" class="alert alert-error mt-3 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <ul>
                                {#each roleAssignmentErrors as error}
                                    <li>{error}</li>
                                {/each}
                            </ul>
                    </div>
                {/if}
            </div>
        </div>
    </div>
    <div class="join-item border border-base-300 p-4">
        <h2 class="text-xl font-medium mb-2">
            Decision making method
        </h2>
        <div class="flex flex-row gap-2">
            <div class="flex-initial w-2/5">
                <div class="flex flex-col">
                    <p class="text-neutral-content pb-2">Given the assigned roles assigned; one of the following methods could be used:</p>
                    {#each availableDecisionMethods as method}
                        <label class="label cursor-pointer w-min">
                            <input
                                type="radio"
                                class="radio"
                                bind:group={$decisionData.decisionMethod}
                                value={method}
                                on:change={() => handleDecisionMethodSelect(method)}
                            />
                            <span class="label-text pl-1 capitalize">{method}</span>
                        </label>
                    {/each}
                </div>
            </div>
            <div class="card w-3/5 bg-base-100 shadow-xl border rounded-md">
                <div class="card-body">
                    <h2 class="card-title">{selectedDecisionMethod.title}</h2>
                    <p>{selectedDecisionMethod.description}</p>
                    <div class="divider"></div>
                    <label class="flex items-center gap-2">
                        <span class="label-text text-neutral-content">Speed</span>
                        <input disabled type="range" min="0" max="4" value="{selectedDecisionMethod.speed}" class="range" />
                    </label>
                    <label class="flex items-center gap-2">
                        <span class="label-text text-neutral-content">Buy-in</span>
                        <input disabled type="range" min="0" max="4" value="{selectedDecisionMethod.buyIn}" class="range" />
                    </label>
                </div>
            </div>
        </div>
    </div>
    <div class="join-item border border-base-300 p-4">
        <h2 class="text-xl font-medium mb-2">
            Schedule
        </h2>
        <div class="flex flex-col gap-2">
            <div class="input input-bordered h-max">
                <p>Schedule</p>
            </div>
        </div>
    </div>
</div>
