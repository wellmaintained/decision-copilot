<script lang="ts">
	import { db, user } from '$lib/firebase';
	import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

	let name = '';
	let description = '';
	const decisionsRef = collection(db, 'decisions');

	async function saveDecision() {
		try {
			const decisionRef = doc(decisionsRef, 'DEC-1');
			await setDoc(decisionRef, {
				name: name,
				description: description,
				user: $user!.uid
			});
			const docSnap = await getDoc(decisionRef);
			console.log('Decision saved: ', docSnap.data());
		} catch (e) {
			console.error('Error adding decision: ', e);
		}
	}
</script>

<h2>Decision Summary</h2>
<form class="w-2/5" on:submit|preventDefault={saveDecision}>
	<label class="input flex items-center gap-2">
		Name
		<input type="text" class="grow" bind:value={name} />
	</label>
	<label class="input flex items-center gap-2">
		Description
		<input type="text" class="grow" bind:value={description} />
	</label>
	<div class="divider"></div>
	<button class="btn btn-success">Next</button>
</form>
