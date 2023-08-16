<script lang="ts">
	import { db, user } from '$lib/firebase';
	import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
	import { page } from '$app/stores';

	let name = '';
	let description = '';
	const decisionsRef = collection(db, 'decisions');
	let decisionId: string;

	$: decisionId = $page.params.id;

	onMount(async () => {
		if (decisionId) {
			const decisionRef = doc(decisionsRef, decisionId);
			const docSnap = await getDoc(decisionRef);
			if (docSnap.exists()) {
				const data = docSnap.data();
				name = data.name;
				description = data.description;
			} else {
				console.error('No such decision!');
			}
		}
	});

	async function saveDecision() {
		try {
			const decisionRef = decisionId ? doc(decisionsRef, decisionId) : doc(decisionsRef);
			const data = {
				name: name,
				description: description,
				user: $user!.uid
			});
			};
			if (decisionId) {
				await updateDoc(decisionRef, data);
			} else {
				await setDoc(decisionRef, data);
			}
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
