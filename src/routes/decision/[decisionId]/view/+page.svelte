<script lang="ts">
    import StakeholderAvatar from '$lib/components/StakeholderAvatar.svelte';
	import type { DecisionRepo } from "$lib/decisionRepo";
	import { getContext } from "svelte";
	import { writable } from "svelte/store";
	import type { Stakeholder } from "$lib/types";

	const decisionRepo = getContext<DecisionRepo>('decisionRepo');
    const decisionData = decisionRepo.latestDecisionData;

    let involvedStakeholders = writable([] as Stakeholder[]);
    decisionData.subscribe(async (value) => {
        if (value?.stakeholders && value?.stakeholders.length>0) {
            involvedStakeholders.set(await decisionRepo.fetchDecisionStakeholderData($decisionData?.stakeholders));
        }
    });

    $: deciders = $involvedStakeholders?.filter((s) => s.role === 'decider');
    $: advisors = $involvedStakeholders?.filter((s) => s.role === 'advisor');
    $: observers = $involvedStakeholders?.filter((s) => s.role === 'observer');
    
</script>
{#if $decisionData}
<div class="flex flex-col gap-1">
    <h1 class="font-bold text-2xl">{$decisionData.title}</h1>
    <p>{$decisionData.description}</p>
    <h2 class="font-semibold text-xl">Decision</h2>
    <p>{$decisionData.decision ?? 'undecided'}</p>

    <h2 class="font-semibold text-xl">Method</h2>
    <p class="capitalize">{$decisionData.decisionMethod}</p>

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
    <table class="table w-full"><tbody>
        <tr>
            <th>Decider{#if (deciders.length > 1)}s{/if}</th>
            <th>Advisor{#if (advisors.length > 1)}s{/if}</th>
            <th>Observer{#if (observers.length > 1)}s{/if}</th>
        </tr>
        <tr>
            <td class="align-top">
                {#each deciders as stakeholder (stakeholder.id)}
                    <StakeholderAvatar {stakeholder} />
                {:else}
                    <span class="loading loading-dots loading-md"></span>
                {/each}
            </td>
            <td class="align-top">
                {#each advisors as stakeholder (stakeholder.id)}
                    <StakeholderAvatar {stakeholder} />
                {/each}
            </td>
            <td class="align-top">
                {#each observers as stakeholder (stakeholder.id)}
                   <StakeholderAvatar {stakeholder} />
                {/each}
            </td>
        </tr>
    </tbody></table>
</div>    
{:else}
    <span class="loading loading-dots loading-md"></span>
{/if}
