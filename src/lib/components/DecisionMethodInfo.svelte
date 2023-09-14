<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { decisionMethods } from '$lib/decisionMethods';

    export let method:string;
    export let isSelected:boolean;

   	const dispatch = createEventDispatcher();
    const decisionMethodInfo = decisionMethods[method];
</script>

 <div class="card lg:w-96 w-full bg-base-100 shadow-md border rounded-md"
    class:border-primary={isSelected}
    class:border-2={isSelected}
    class:shadow-primary-content={isSelected}
    >
    <div class="card-body">
        <h2 class="card-title">{decisionMethodInfo.title}</h2>
        <p>{decisionMethodInfo.description}</p>
        <div class="divider"></div>
        <label class="flex items-center gap-2">
            <span class="label-text text-neutral-content">Speed</span>
            <input disabled type="range" min="0" max="4" value="{decisionMethodInfo.speed}" class="range" />
        </label>
        <label class="flex items-center gap-2">
            <span class="label-text text-neutral-content">Buy-in</span>
            <input disabled type="range" min="0" max="4" value="{decisionMethodInfo.buyIn}" class="range" />
        </label>
        <div class="card-actions justify-center mt-4">
            <button class="btn btn-primary" on:click={(_) => dispatch("select")}>Select</button>
        </div>
    </div>
</div>