<script lang="ts">
  import DecisionMethod from '$lib/components/DecisionMethod.svelte';

    import { getContext } from 'svelte';
	import type { DecisionRepo } from '$lib/decisionRepo';
	import RadioButtonOptions from '$lib/components/RadioButtonOptions.svelte';
	import { writable } from 'svelte/store';
	import type { Stakeholder } from '$lib/types';
	import StakeholderAvatar from '$lib/components/StakeholderAvatar.svelte';
	
	const decisionRepo = getContext<DecisionRepo>('decisionRepo');
	const decisionData = decisionRepo.latestDecisionData;
    let involvedStakeholders = writable([] as Stakeholder[]);
    let roleAssignmentErrors = writable([] as string[]);
    let openAccordianStep = writable("assign");
    
    validateRoleAssignment();

    decisionData.subscribe(async (d) => {
        if (d?.stakeholders && d.stakeholders.length>0) {
            involvedStakeholders.set(await decisionRepo.fetchDecisionStakeholderData(d.stakeholders));
        }
    });

    async function handleDecisionMethodSelect(decisionMethod: string): Promise<void> {
		await decisionRepo.updateDecisionField('decisionMethod', decisionMethod);
        $openAccordianStep = "assign";
	}

    function validateRoleAssignment(): boolean {
        $roleAssignmentErrors = [];
        if ($decisionData?.stakeholders && $decisionData?.stakeholders.length>0) {
            if ($decisionData.stakeholders.filter((s) => !s.role).length > 0) {
                $roleAssignmentErrors.push("Every stakeholder must have a role assigned");
            }
            if ($decisionData.stakeholders.filter((s) => s.role === 'decider').length === 0) {
                $roleAssignmentErrors.push("At least 1 stakeholder must be assigned the Decider role");
            } 
        }
        if ($roleAssignmentErrors.length > 0) {
            $openAccordianStep = "assign";
            return false;
        }
        return true;
    }

	function handleStakeholderRoleChange(stakeholder_id: string, role: string): void {
        decisionRepo.updateStakeholderRole(stakeholder_id, role);
	}

	function handleAssignRolesNext(_: Event) {
        if (validateRoleAssignment()) {
            $openAccordianStep = "schedule";
        }
	}
</script>

<div class="join join-vertical w-full">
    <div class="collapse collapse-arrow join-item border border-base-300">
        <input type="radio" name="step-accordian" checked={$openAccordianStep=="assign"} /> 
        <div class="collapse-title text-xl font-medium">
            Assign roles
        </div>
        <div class="collapse-content"> 
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
                    {#if $roleAssignmentErrors.length > 0}
                        <div role="alert" class="alert alert-error mt-3 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <ul>
                                    {#each $roleAssignmentErrors as error}
                                        <li>{error}</li>
                                    {/each}
                                </ul>
                        </div>
                    {/if}
                </div>
                <button class="btn btn-primary w-1/4 ml-auto mr-2" on:click={handleAssignRolesNext}>Next</button>
            </div>
        </div>
    </div>
    <div class="collapse collapse-arrow join-item border border-base-300">
        <input type="radio" name="step-accordian" checked={$openAccordianStep=="select"} /> 
    <div class="collapse-title">
        <h2 class="text-xl font-medium">
            Decision making method
            {#if $decisionData?.decisionMethod}
                <span class="badge badge-outline badge-lg capitalize">{$decisionData?.decisionMethod}</span>
            {/if}
        </h2>
    </div>
    <div class="collapse-content"> 
        <div class="flex flex-wrap gap-4">
            <DecisionMethod 
                title="Autocratic"
                description="The person driving the process makes a decision and informs all stakeholders"
                speed={4}
                buyIn={0}
                on:select={(_) => handleDecisionMethodSelect("autocratic")}  
                isSelected={$decisionData?.decisionMethod === "autocratic"}
            />
            <DecisionMethod 
                title="Democratic"
                description="Option with the most votes wins"
                speed={0}
                buyIn={4}
                on:select={(_) => handleDecisionMethodSelect("democratic")}       
                isSelected={$decisionData?.decisionMethod === "democratic"}         
            />
            <DecisionMethod 
                title="Consent"
                description="The proposal is selected if no one has a strong/reasoned objection"
                speed={3}
                buyIn={3}
                on:select={(_) => handleDecisionMethodSelect("consent")}     
                isSelected={$decisionData?.decisionMethod === "consent"}           
            />            
        </div>
    </div>
  </div>
  
    <div class="collapse collapse-arrow join-item border border-base-300">
    <input type="radio" name="step-accordian" checked={$openAccordianStep=="schedule"} /> 
    <div class="collapse-title text-xl font-medium">
      Schedule
    </div>
    <div class="collapse-content"> 
      <div class="flex flex-col gap-2">
			<div class="input input-bordered h-max">
                <p>Schedule</p>
			</div>
		</div>
    </div>
  </div>
</div>
