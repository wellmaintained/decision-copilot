<script lang="ts">
    import SortableList from "$lib/components/SortableList.svelte";
	import type { DecisionRepo } from '$lib/decisionRepo';
	import { docStore } from 'sveltefire';
	import type { Decision } from '$lib/types';
	import { firestore } from '$lib/firebase';

    export let decisionRepo: DecisionRepo; 
    const decisionStore = docStore<Decision>(firestore, `decisions/${decisionRepo.decisionId}`);

    $: decisionOptions = $decisionStore?.options ?? [];
</script>

<div class="flex flex-col gap-2">
    <div class="flex flex-row items-center">
        <span class="text-neutral-content">Options</span>
        <button
            aria-label="Add decision option"
            on:click={(_) => decisionRepo.addOption()}
            class="btn btn-ghost btn-sm btn-accent w-min h-min"
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="black">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        </button>
    </div>
    <SortableList list={decisionOptions} on:sort={decisionRepo.sortOptions} let:item={option} let:index>
        <label class="input input-bordered flex items-center gap-2">
            <span class="label-text text-neutral-content cursor-move">{index+1}</span>
            <input
                type="text"
                class="grow"
                value={option.title}
                placeholder="Describe the option in a few words"
                on:blur={(event) => decisionRepo.updateOption(option, event)}
            />
            <button class="btn btn-ghost btn-xs" tabindex=-1 on:click={() => decisionRepo.deleteOption(option)}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                </svg>
            </button>
        </label>
    </SortableList>
</div>
