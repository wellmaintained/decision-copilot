<script lang="ts">
  import DecisionMethod from '$lib/components/DecisionMethod.svelte';

    import { getContext } from 'svelte';
	import type { DecisionRepo } from '$lib/decisionRepo';
	import { collectionStore } from 'sveltefire';
	import { firestore } from '$lib/firebase';
	import { collection, documentId, query, where } from 'firebase/firestore';
	import RadioButtonOptions from '$lib/components/RadioButtonOptions.svelte';
	
	const decisionRepo = getContext<DecisionRepo>('decisionRepo');
	const decisionData = decisionRepo.latestDecisionData;

    let openAccordianStep:string = "select";
    if ($decisionData?.decisionMethod) {
        openAccordianStep = "assign";
    }

    let completed_steps: string[] = [];
    $: {
        if ($decisionData?.decisionMethod) {
            completed_steps.push("select");
        }
        // if ($decisionData?.roles) {
        //     completed_steps.push("assign");
        // }
        // if ($decisionData?.stakeholders) {
        //     completed_steps.push("inform");
        // }
        completed_steps = completed_steps
    }
    let involvedStakeholders
    $: {
        let selectedStakeholderIds = $decisionData?.stakeholders;
        if (!selectedStakeholderIds || selectedStakeholderIds?.length==0) {
            selectedStakeholderIds = ['1']
        }
        involvedStakeholders = collectionStore(firestore,
            query(
                collection(firestore, 'stakeholders'), 
                where(documentId(), 'in', selectedStakeholderIds)
            )
        );
     }

	async function handleDecisionMethodSelect(decisionMethod: string): Promise<void> {
		await decisionRepo.updateDecisionField('decisionMethod', decisionMethod);
        openAccordianStep = "assign";
        openAccordianStep = openAccordianStep;
	}

	function handleStakeholderRoleChange(id: any, detail: any): void {
		console.log("handleStakeholderRoleChange", id, detail);
	}
</script>
<ul class="steps w-full mb-4">
  <li class="step" class:step-primary={completed_steps.includes("select")}>Select method</li>
  <li class="step step-primary" class:step-primary={completed_steps.includes("assign")}>Assign roles</li>
  <li class="step" class:step-primary={completed_steps.includes("inform")}>Inform stakeholders</li>
</ul>

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
					{#each $involvedStakeholders ?? [] as stakeholder (stakeholder.id)}
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
                                selected={$decisionData?.roles?.[stakeholder.id]}
                                on:changeOption={(e) => handleStakeholderRoleChange(stakeholder.id, e.detail)}
                            />
					</td></tr>
					{:else}
            			<tr><td><span class="loading loading-dots loading-md"></span></td></tr>
					{/each}
				</tbody></table>
			</div>
		</div>
    </div>
  </div>
</div>
