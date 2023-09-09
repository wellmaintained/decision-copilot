<script lang="ts">
  import DecisionMethod from '$lib/components/DecisionMethod.svelte';

    import { getContext } from 'svelte';
	import type { DecisionRepo } from '$lib/decisionRepo';
	import RadioButtonOptions from '$lib/components/RadioButtonOptions.svelte';
	import { writable } from 'svelte/store';
	import type { User } from '$lib/types';
	
	const decisionRepo = getContext<DecisionRepo>('decisionRepo');
	const decisionData = decisionRepo.latestDecisionData;

    let openAccordianStep:string = "select";
    if ($decisionData?.decisionMethod) {
        openAccordianStep = "assign";
    }
    let stakeholdersWithRoleCount = 0;
    for (let stakeholder of $decisionData?.stakeholders || []) {
        if (stakeholder.role) {
            stakeholdersWithRoleCount++;
        }
    }
    if (stakeholdersWithRoleCount === $decisionData?.stakeholders?.length) {
        openAccordianStep = "schedule";
    }

    let involvedStakeholders = writable([] as User[]);
    decisionData.subscribe(async (value) => {
        if (value?.stakeholders && value?.stakeholders.length>0) {
            involvedStakeholders.set(await decisionRepo.fetchDecisionStakeholderData($decisionData?.stakeholders));
        }
    });

	async function handleDecisionMethodSelect(decisionMethod: string): Promise<void> {
		await decisionRepo.updateDecisionField('decisionMethod', decisionMethod);
        openAccordianStep = "assign";
        openAccordianStep = openAccordianStep;
	}

	function handleStakeholderRoleChange(stakeholder_id: string, role: string): void {
        decisionRepo.updateStakeholderRole(stakeholder_id, role);
	}
</script>

<div class="join join-vertical w-full">
    <div class="collapse collapse-arrow join-item border border-base-300">
        <input type="radio" name="step-accordian" checked={openAccordianStep=="select"} /> 
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
    <input type="radio" name="step-accordian" checked={openAccordianStep=="assign"} /> 
    <div class="collapse-title text-xl font-medium">
      Assign roles
    </div>
    <div class="collapse-content"> 
      <div class="flex flex-col gap-2">
			<div class="input input-bordered h-max">
                <table class="table w-full"><tbody>
					{#each $involvedStakeholders as stakeholder (stakeholder.id)}
                    <tr><td>
                        <div class="flex flex-row items-center gap-2">
                            <div class="avatar w-8 h-8 rounded-full overflow-hidden border-base-300 border">
                                <img alt="Avatar for {stakeholder.displayName}" src={stakeholder.photoURL.toString()} />
                            </div>
                            <div class="label-text w-max">{stakeholder.displayName}</div>
                        </div> 
                    </td>
                    <td>
                        <RadioButtonOptions 
                                options={[
                                    {key: "decider", label: "Decider", explaination: "The person making the decision"},
                                    {key: "advisor", label: "Advisor", explaination: "The person providing advice"},
                                    {key: "observer", label: "Observer", explaination: "The person being informed"}
                                ]}
                                selected={$decisionData?.stakeholders?.find((s) => s.stakeholder_id === stakeholder.id)?.role}
                                on:changeOption={(e) => handleStakeholderRoleChange(stakeholder.id, e.detail)}
                            />
					</td></tr>
					{:else}
            			<tr><td><span class="loading loading-dots loading-md"></span></td></tr>
					{/each}
				</tbody></table>
			</div>
            <button class="btn btn-primary w-1/4 ml-auto mr-2" on:click={(_) => openAccordianStep="schedule"}>Next</button>
		</div>
    </div>
  </div>
    <div class="collapse collapse-arrow join-item border border-base-300">
    <input type="radio" name="step-accordian" checked={openAccordianStep=="schedule"} /> 
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
