<script lang="ts">
	import type { DecisionRepo } from "$lib/decisionRepo";
	import { firestore } from "$lib/firebase";
	import { collection, documentId, query, where } from "firebase/firestore";
	import { getContext } from "svelte";
	import { fade } from "svelte/transition";
	import { collectionStore } from "sveltefire";

    const decisionRepo = getContext('decisionRepo') as DecisionRepo;
    const decisionData = decisionRepo.latestDecisionData;

    $: involvedStakeholders = collectionStore(firestore,
        query(
            collection(firestore, 'stakeholders'), 
            where(documentId(), 'in', $decisionData?.stakeholders ?? ['1'])
        )
    );
</script>
{#if $decisionData}
    <h1 class="font-bold text-2xl">{$decisionData.title}</h1>
    <p>{$decisionData.description}</p>
    <h2 class="font-semibold text-xl">Decision</h2>
    <p>{$decisionData.decision ?? 'undecided'}</p>

    <h2 class="font-semibold text-xl">Options considered</h2>
    <ol class="list-inside list-decimal">
        {#each $decisionData.options ?? [] as option}
            <li>{option.title}</li>
        {/each}
    </ol>

    <h2 class="font-semibold text-xl">Criteria</h2>
    <ol class="list-inside list-decimal">
        {#each $decisionData.criteria ?? [] as criterion}
            <li>{criterion.title}</li>
        {/each}
    </ol>

    <h2 class="font-semibold text-xl">Stakeholders</h2>
    <ul class="flex flex-row gap-2">
        {#each $involvedStakeholders as stakeholder (stakeholder.id)}
            <li class="flex flex-row items-center gap-2" transition:fade>
                <div class="avatar w-8 h-8 rounded-full overflow-hidden border-base-300 border">
                    <img alt="Avatar for {stakeholder.displayName}" src={stakeholder.photoURL.toString()} />
                </div>
                <div class="label-text w-16">{stakeholder.displayName}</div>
            </li>
        {:else}
            <span class="loading loading-dots loading-md"></span>
        {/each}
    </ul>
{:else}
    <span class="loading loading-dots loading-md"></span>
{/if}
