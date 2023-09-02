<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let options: {key: string, label: string, explaination: string}[];
	export let selected: string | undefined;
	const dispatch = createEventDispatcher();
</script>

{#each options as option (option.key)}
	<div class="tooltip" data-tip="{option.explaination}">
		<label class="label cursor-pointer tooltop">
			<input
				type="radio"
				class="radio"
				bind:group={selected}
				value={option.key}
				on:change={(event) => dispatch("changeOption", event.target?.value)}
			/>
			<span class="label-text pl-1">{option.label}</span>
		</label>
	</div>
{/each}