<script lang="ts">
	import { decisionMethods } from '$lib/decisionMethods';
	import type { DocStore } from '$lib/decisionRepo';
    import type { Decision, DecisionStep } from '$lib/types';
		
    export let decision: DocStore<Decision>;

	function determineIfDecisionStepCompleted(step: DecisionStep, decision: Decision): boolean {
        switch (step.type) {
            case "identify":
                return decision.title!=undefined && decision.title.length > 0 
                && decision.description!=undefined && decision.description.length > 0
                && decision.reversibility!=undefined && decision.reversibility.length > 0
                && decision.cost!=undefined && decision.cost.length > 0
                && decision.stakeholders!=undefined && decision.stakeholders.length > 0;
            case "select":
                return decision.decisionMethod!=undefined && decision.decisionMethod != 'unknown'; 
            case "generate":
                return decision.options!=undefined && decision.options.length > 0;
            case "vote":
            case "objection":
            case "choose":
                return decision.decision!=undefined && decision.decision.length > 0;
        }
        return false;
	}
    const preSteps: DecisionStep[] = [
        {
            type: "identify",
            icon: "🔍",
            who: "Driver",
            title: "Identify the decision",
            description: "Capture decision details"
        },
        {
            type: "select",
            icon: "⚙️",
            who: "Driver",
            title: "Select method",
            description: "Assign roles & select a decision making method"
        }
    ];
    const postSteps: DecisionStep[] = [
        {
            type: "publish",
            icon: "📚",
            who: "Driver",
            title: "Publish",
            description: "The decision is published for observers"
        }
    ];
    let decisionSteps: DecisionStep[] = [];
    $: {
            let decisionMethodSteps = decisionMethods[$decision?.decisionMethod ?? 'unknown'].steps || decisionMethods['unknown'].steps;
            decisionSteps = [...preSteps, ...decisionMethodSteps, ...postSteps];
    }
</script>

{#if $decision}
<ul class="steps steps-vertical">
    {#each decisionSteps as step}
        <li 
            class="step step-base-300"
            title="{step.type}"
            class:step-success={determineIfDecisionStepCompleted(step, $decision)}
            data-content={step.icon}
        >
            <div class="step-content text-left">
                <div class="badge badge-outline capitalize">{step.who}</div>
                <div>{step.title}</div>
                <div class="text-neutral-content">{step.description}</div>
            </div>
        </li>
    {/each}
</ul>
{/if}
