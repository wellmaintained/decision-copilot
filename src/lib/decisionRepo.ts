import { firestore } from '$lib/firebase';
import {
	DocumentReference,
	arrayRemove,
	arrayUnion,
	doc,
	getDoc,
	serverTimestamp,
	updateDoc
} from 'firebase/firestore';
import type { Decision, DecisionCriteria, DecisionOption } from './types';
import { docStore } from 'sveltefire';
interface DocStore<T> {
	subscribe: (cb: (value: T | null) => void) => void | (() => void);
	ref: DocumentReference<T> | null;
	id: string;
}

export type DecisionRepo = {
	decisionId: string;
	latestDecisionData: DocStore<Decision>;
	updateDecisionField: (field: string, value: any) => Promise<void>;
	changeStakeholder: (event: Event) => Promise<void>;
	handleDescriptionUpdate: (e: CustomEvent) => Promise<void>;
	handleDecisionUpdate: (e: CustomEvent) => Promise<void>;
	addOption: () => Promise<void>;
	updateOption: (option: DecisionOption, event: Event) => Promise<void>;
	deleteOption: (option: DecisionOption) => Promise<void>;
	sortOptions: (e: CustomEvent) => Promise<void>;
	addCriterion: () => Promise<void>;
	updateCriterion: (criterion: DecisionCriteria, event: Event) => Promise<void>;
	deleteCriterion: (criterion: DecisionCriteria) => Promise<void>;
	sortCriteria: (e: CustomEvent) => Promise<void>;
};

export function createDecisionRepo(decisionId: string): DecisionRepo {
	const decisionRef = doc(firestore, `decisions/${decisionId}`);

	return {
		decisionId: decisionId,
		latestDecisionData: docStore<Decision>(firestore, `decisions/${decisionId}`),
		updateDecisionField: async function (field: string, value) {
			await updateDoc(decisionRef, {
				[field]: value,
				updatedAt: serverTimestamp()
			});
		},
		changeStakeholder: async function (event: Event) {
			const user_id = (event.target as HTMLInputElement).value;
			const isChecked = (event.target as HTMLInputElement).checked;
			if (isChecked) {
				await updateDoc(decisionRef, {
					stakeholders: arrayUnion(user_id),
					updatedAt: serverTimestamp()
				});
			} else {
				await updateDoc(decisionRef, {
					stakeholders: arrayRemove(user_id),
					updatedAt: serverTimestamp()
				});
			}
		},
		handleDescriptionUpdate: async function (e: CustomEvent) {
			await updateDoc(decisionRef, {
				description: e.detail,
				updatedAt: serverTimestamp()
			});
		},
		handleDecisionUpdate: async function (e: CustomEvent) {
			await updateDoc(decisionRef, {
				decision: e.detail,
				updatedAt: serverTimestamp()
			});
		},
		addOption: async function () {
			await updateDoc(decisionRef, {
				options: arrayUnion({
					id: Date.now(),
					title: ''
				}),
				updatedAt: serverTimestamp()
			});
		},
		updateOption: async function (option: DecisionOption, event: Event) {
			const newTitle = (event.target as HTMLInputElement).value;
			if (option.title === newTitle) return;

			const decisionSnapshot = await getDoc(decisionRef);
			const decisionOptions = decisionSnapshot.data()?.options;
			const currentOption = decisionOptions.find((o: DecisionOption) => o.id === option.id);
			currentOption.title = newTitle;
			await updateDoc(decisionRef, {
				options: decisionOptions,
				updatedAt: serverTimestamp()
			});
		},
		deleteOption: async function (option: DecisionOption) {
			await updateDoc(decisionRef, {
				options: arrayRemove(option)
			});
		},
		sortOptions: async function (e: CustomEvent) {
			const newList = e.detail;
			await updateDoc(decisionRef, {
				options: newList,
				updatedAt: serverTimestamp()
			});
		},
		addCriterion: async function () {
			await updateDoc(decisionRef, {
				criteria: arrayUnion({
					id: Date.now(),
					title: ''
				}),
				updatedAt: serverTimestamp()
			});
		},
		updateCriterion: async function (criterion: DecisionCriteria, event: Event) {
			const newTitle = (event.target as HTMLInputElement).value;
			if (criterion.title === newTitle) return;

			const decisionSnapshot = await getDoc(decisionRef);
			const decisionCriteria = decisionSnapshot.data()?.criteria;
			const currentCriterion = decisionCriteria.find(
				(c: DecisionCriteria) => c.id === criterion.id
			);
			currentCriterion.title = newTitle;
			await updateDoc(decisionRef, {
				criteria: decisionCriteria,
				updatedAt: serverTimestamp()
			});
		},
		deleteCriterion: async function (criterion: DecisionCriteria) {
			await updateDoc(decisionRef, {
				criteria: arrayRemove(criterion),
				updatedAt: serverTimestamp()
			});
		},
		sortCriteria: async function (e: CustomEvent) {
			const newList = e.detail;
			updateDoc(decisionRef, {
				criteria: newList,
				updatedAt: serverTimestamp()
			});
		}
	};
}
