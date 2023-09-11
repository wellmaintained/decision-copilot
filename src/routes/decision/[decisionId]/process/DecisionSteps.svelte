<script lang="ts">
    import type { Decision, DecisionStep } from '$lib/types';
		
    export let decision: Decision;
    export let decisionSteps: DecisionStep[];

	function emojiForStep(step: DecisionStep): string {
		switch (step.type) {
            case "generate":
                return "💡";
            case "vote":
                return "🗳️";
            case "choose":
                return "👉";
            case "objection":
                return "✋";
        }
        return "";
	}

	function determineIfDecisionStepCompleted(step: DecisionStep, decision: Decision): boolean {
		switch (step.type) {
            case "generate":
                return decision.options!=undefined && decision.options.length > 0;
            case "vote":
            case "objection":
            case "choose":
                return decision.decision!=undefined && decision.decision.length > 0;
        }
        return false;
	}
</script>

<ul class="steps steps-vertical">
    <li class="step step-success" title="identify decision" data-content="🔍">
        <div class="step-content text-left pt-5">
            <div><span class="badge badge-outline capitalize w-28">Driver</span>&nbsp;Identify the decision</div>
            <div class="text-neutral-content">Details of the decision to be made are captured</div>
        </div>
    </li>
    <li class="step step-success" title="select method" data-content="⚙️">
        <div class="step-content text-left pt-5">
            <div><span class="badge badge-outline capitalize w-28">Driver</span>&nbsp;Select method</div>
            <div class="text-neutral-content">Stakeholders are assigned roles and a decision making method is selected</div>
        </div>
    </li>
    {#each decisionSteps as step}
    <li 
        class="step step-base-300"
        title="{step.type}"
        class:step-success={determineIfDecisionStepCompleted(step, decision)}
        data-content={emojiForStep(step)}
    >
        <div class="step-content text-left pt-5">
            <div><span class="badge badge-outline capitalize min-w-28">{step.who}</span>&nbsp;{step.title}</div>
            <div class="text-neutral-content">{step.description}</div>
        </div>
    </li>
    {/each}
    <li class="step" title="publish decision" data-content="📚">
        <div class="step-content text-left pt-5">
            <div><span class="badge badge-outline capitalize w-28">Driver</span>&nbsp;Publish </div>
            <div class="text-neutral-content">The decision is published for observers</div>
        </div>
    </li>
</ul>

