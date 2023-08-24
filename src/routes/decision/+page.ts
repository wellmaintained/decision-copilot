import { firestore } from '$lib/firebase';
import { getDocs, query, collection, orderBy, limit } from 'firebase/firestore';
import type { PageLoad } from './$types';

export const load = (async () => {
	const projectsSnapshot = await getDocs(
		query(collection(firestore, `projects`), orderBy('name'), limit(1))
	);
	let currentProjectId = 'unknown';
	if (!projectsSnapshot.empty) {
		currentProjectId = projectsSnapshot.docs[0].id;
	}
	return {
		currentProjectId: currentProjectId
	};
}) satisfies PageLoad;
