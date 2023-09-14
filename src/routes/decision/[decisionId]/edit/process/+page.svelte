<script lang="ts">
    import { getContext } from 'svelte';
	import type { DecisionRepo } from '$lib/decisionRepo';
	import RadioButtonOptions from '$lib/components/RadioButtonOptions.svelte';
	import { writable } from 'svelte/store';
	import type { Decision, Stakeholder } from '$lib/types';
	import StakeholderAvatar from '$lib/components/StakeholderAvatar.svelte';
	import DecisionMethodInfo from '$lib/components/DecisionMethodInfo.svelte';
	
	const decisionRepo = getContext<DecisionRepo>('decisionRepo');
    const decisionData = decisionRepo.latestDecisionData;
    let involvedStakeholders = writable([] as Stakeholder[]);
    let roleAssignmentErrors:string[] = [];
    let availableDecisionMethods:string[] = [];
    let selectedDecisionMethod:string = 'unknown';

    function validateRoleAssignment(decision:Decision|null): string[] {
        roleAssignmentErrors = [];
        if (decision && decision.stakeholders && decision.stakeholders.length>0) {
            const deciders = decision.stakeholders.filter((s) => s.role === 'decider');
            const advisors = decision.stakeholders.filter((s) => s.role === 'advisor');
            const observers = decision.stakeholders.filter((s) => s.role === 'observer');
            if (deciders.length === 0) {
                roleAssignmentErrors.push("At least 1 stakeholder must be assigned a Decider role");
            } 
            if (deciders.length + advisors.length + observers.length != decision.stakeholders.length) {
                roleAssignmentErrors.push("Every stakeholder must be assigned a role");
            }
        }
        return roleAssignmentErrors;
    }

    function determineAvailableDecisionMethods(decision:Decision|null): string[] {
        availableDecisionMethods = [];
        if (decision && decision.stakeholders && decision.stakeholders.length>0) {
            const deciders = decision.stakeholders.filter((s) => s.role === 'decider');
            const advisors = decision.stakeholders.filter((s) => s.role === 'advisor');

            if (deciders.length === 1) {
                availableDecisionMethods.push("autocratic");
            } else if (deciders.length > 1) {
                availableDecisionMethods.push("democratic")
            }
            if (deciders.length > 0 && advisors.length > 0 ) {
                availableDecisionMethods.push("consent")
            }
        }
        return availableDecisionMethods;
    }

	async function handleStakeholderRoleChange(decision:Decision|null, stakeholder_id: string, role: string): Promise<void> {
        const updatedDecision = await decisionRepo.updateStakeholderRole(stakeholder_id, role);
        if (validateRoleAssignment(updatedDecision).length > 0) {
            await decisionRepo.updateDecisionField('decisionMethod', 'unknown');
        }
	}

    async function handleDecisionMethodSelect(decisionMethod: string): Promise<void> {
		await decisionRepo.updateDecisionField('decisionMethod', decisionMethod);
	}
    
    decisionData.subscribe(async (decision) => {
        if (decision?.stakeholders && decision.stakeholders.length>0) {
            involvedStakeholders.set(await decisionRepo.fetchDecisionStakeholderData(decision.stakeholders));               
            roleAssignmentErrors = validateRoleAssignment(decision);
            availableDecisionMethods = determineAvailableDecisionMethods(decision);
        }
        selectedDecisionMethod = decision?.decisionMethod ?? 'unknown';
    });


	function nextStep(event: Event) {
		throw new Error('Function not implemented.');
	}
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
                                        {key: "decider", label: "Decider", explaination: "Makes the decision"},
                                        {key: "advisor", label: "Advisor", explaination: "Povides advice to the decider(s)"},
                                        {key: "observer", label: "Observer", explaination: "Wants to know the result but has no say in the decision"},
                                    ]}
                                    selected={$decisionData?.stakeholders?.find((s) => s.stakeholder_id === stakeholder.id)?.role}
                                    on:changeOption={(e) => handleStakeholderRoleChange($decisionData, stakeholder.id, e.detail)}
                                />
                        </div>
                    </div>
                {:else}
                    <div class="loading loading-dots loading-md"></div>
                {/each}
            </div>
        </div>
    </div>
    <div class="join-item border border-base-300 p-4">
        <h2 class="text-xl font-medium mb-2">
            Decision making method
        </h2>
        <p class="text-neutral-content pb-2">Given the assigned roles assigned; one of the following methods could be used:</p>
        <div class="flex flex-row gap-2">
            {#each availableDecisionMethods as method}
                <DecisionMethodInfo {method}
                    isSelected={selectedDecisionMethod===method}
                    on:select={() => handleDecisionMethodSelect(method)} />
            {:else}
                <div role="alert" class="alert alert-error mt-3 mb-3">
                    <div class="flex flex-col text-left">
                        <p class="break-after-column font-semibold mb-2">It isn't possible to make a decision given the selected roles.</p>
                        <ul class="list-inside list-decimal">
                            {#each roleAssignmentErrors as error}
                                <li>{error}</li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/each}    
        </div>
    </div>
</div>