<script lang="ts">
	import { createEventDispatcher } from "svelte";

    export let title:string;
    export let description:string;
    export let speed:number;
    export let buyIn:number;
    export let isSelected:boolean;

   	const dispatch = createEventDispatcher();
</script>

 <div class="card lg:w-96 w-full bg-base-100 shadow-xl border rounded-md"
    class:border-primary={isSelected}>
    <div class="card-body">
        <h2 class="card-title">{title}</h2>
        <p>{description}</p>
        <div class="divider"></div>
        <label class="flex items-center gap-2">
            <span class="label-text text-neutral-content">Speed</span>
            <input disabled type="range" min="0" max="4" value="{speed}" class="range" />
        </label>
        <label class="flex items-center gap-2">
            <span class="label-text text-neutral-content">Buy-in</span>
            <input disabled type="range" min="0" max="4" value="{buyIn}" class="range" />
        </label>
        <div class="card-actions justify-center mt-4">
            <button class="btn btn-primary" on:click={(_) => dispatch("select")}>Select</button>
        </div>
    </div>
</div>
