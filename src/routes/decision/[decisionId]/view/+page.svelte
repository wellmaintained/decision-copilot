<script lang="ts">
	import type { DecisionRepo } from "$lib/decisionRepo";
	import { firestore } from "$lib/firebase";
	import type { Decision } from "$lib/types";
	import { collection, documentId, query, where } from "firebase/firestore";
	import { getContext } from "svelte";
	import { collectionStore, docStore } from "sveltefire";

    const decisionRepo = getContext('decisionRepo') as DecisionRepo;
    const decisionData = docStore<Decision>(firestore, `decisions/${decisionRepo.decisionId}`)

    $: involvedStakeholders = collectionStore(firestore,
        query(
            collection(firestore, 'stakeholders'), 
            where(documentId(), 'in', $decisionData?.stakeholders ?? ['1'])
        )
    );
</script>

<h1 class="font-bold text-2xl">{$decisionData?.title}</h1>
<p>{$decisionData?.description}</p>
<h2 class="font-semibold text-xl">Decision</h2>
<p>{$decisionData?.decision ?? 'undecided'}</p>

<h2 class="font-semibold text-xl">Options considered</h2>
<ol class="list-inside list-decimal">
    {#each $decisionData?.options ?? [] as option}
        <li>{option.title}</li>
    {/each}
</ol>

<h2 class="font-semibold text-xl">Criteria</h2>
<ol class="list-inside list-decimal">
    {#each $decisionData?.criteria ?? [] as criterion}
        <li>{criterion.title}</li>
    {/each}
</ol>

<h2 class="font-semibold text-xl">Stakeholders</h2>
<ul class="grid grid-cols-4">
    {#each $involvedStakeholders ?? [] as stakeholder}
        <li class="flex flex-row items-center gap-2">
            <div class="avatar w-8 h-8 rounded-full overflow-hidden border-base-300 border">
                <img alt="Avatar for {stakeholder.displayName}" src={stakeholder.photoURL.toString()} />
            </div>
            <div class="label-text">{stakeholder.displayName}</div>
        </li>
    {/each}
</ul>


