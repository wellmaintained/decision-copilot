<script lang="ts">
  import DecisionMethod from '$lib/components/DecisionMethod.svelte';

    import { getContext } from 'svelte';
	import type { DecisionRepo } from '$lib/decisionRepo';
	
	const decisionRepo = getContext<DecisionRepo>('decisionRepo');
	const decisionData = decisionRepo.latestDecisionData;

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
</script>

<ul class="steps w-full mb-4">
  <li class="step" class:step-primary={completed_steps.includes("select")}>Select method</li>
  <li class="step step-primary" class:step-primary={completed_steps.includes("assign")}>Assign roles</li>
  <li class="step" class:step-primary={completed_steps.includes("inform")}>Inform stakeholders</li>
</ul>

<div class="flex gap-4">
    <DecisionMethod 
        title="Driver decides"
        description="The person driving the process makes a decision and informs all stakeholders"
        speed={4}
        buyIn={0}
        on:select={(_) => decisionRepo.updateDecisionField('decisionMethod', "driver")}  
        isSelected={$decisionData?.decisionMethod === "driver"}
    />
    <DecisionMethod 
        title="Vote"
        description="The person driving the process makes a decision and informs all stakeholders"
        speed={0}
        buyIn={4}
        on:select={(_) => decisionRepo.updateDecisionField('decisionMethod', "vote")}       
        isSelected={$decisionData?.decisionMethod === "vote"}         
    />
    <DecisionMethod 
        title="Expert decides"
        description="The person driving the process makes a decision and informs all stakeholders"
        speed={3}
        buyIn={1}
        on:select={(_) => decisionRepo.updateDecisionField('decisionMethod', "expert")}     
        isSelected={$decisionData?.decisionMethod === "expert"}           
    />
</div>