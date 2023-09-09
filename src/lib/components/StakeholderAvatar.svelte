<script lang="ts">
	import type { Stakeholder } from "$lib/types";

	export let stakeholder: Stakeholder; 
</script>

<div class="flex flex-row items-center gap-2">
    <div class="avatar w-8 h-8 rounded-full overflow-hidden border-base-300 border">
        <img alt="Avatar for {stakeholder.displayName}" src={stakeholder.photoURL.toString()} />
    </div>
    <div class="label-text w-max">{stakeholder.displayName}</div>
</div>

