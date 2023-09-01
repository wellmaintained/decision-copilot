import { firestore } from '$lib/firebase';
import {
	arrayRemove,
	arrayUnion,
	doc,
	getDoc,
	serverTimestamp,
	updateDoc
} from 'firebase/firestore';

export type DecisionRepo = {
	decisionId: string;
	updateDecisionField: (field: string, event: Event) => Promise<void>;
	changeStakeholder: (event: Event) => Promise<void>;
	handleDescriptionUpdate: (e: CustomEvent) => Promise<void>;
	handleDecisionUpdate: (e: CustomEvent) => Promise<void>;
	addOption: () => Promise<void>;
	updateOption: (option: any, event: Event) => Promise<void>;
	deleteOption: (option: any) => Promise<void>;
	sortOptions: (e: CustomEvent) => Promise<void>;
	addCriterion: () => Promise<void>;
	updateCriterion: (criterion: any, event: Event) => Promise<void>;
	deleteCriterion: (criterion: any) => Promise<void>;
	sortCriteria: (e: CustomEvent) => Promise<void>;
};

export function createDecisionRepo(decisionId: string): DecisionRepo {
	const decisionRef = doc(firestore, `decisions/${decisionId}`);

	return {
		decisionId: decisionId,
		updateDecisionField: async function (field: string, event: Event) {
			const formElement = event.target as HTMLInputElement;
			const newValue = formElement.value;
			await updateDoc(decisionRef, {
				[field]: newValue,
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
				})
			});
		},
		updateOption: async function (option: any, event: Event) {
			const newTitle = (event.target as HTMLInputElement).value;
			if (option.title === newTitle) return;

			const decisionSnapshot = await getDoc(decisionRef);
			const decisionOptions = decisionSnapshot.data()?.options;
			const currentOption = decisionOptions.find((o: any) => o.id === option.id);
			currentOption.title = newTitle;
			await updateDoc(decisionRef, {
				options: decisionOptions
			});
		},
		deleteOption: async function (option: any) {
			await updateDoc(decisionRef, {
				options: arrayRemove(option)
			});
		},
		sortOptions: async function (e: CustomEvent) {
			const newList = e.detail;
			await updateDoc(decisionRef, {
				options: newList
			});
		},
		addCriterion: async function () {
			await updateDoc(decisionRef, {
				criteria: arrayUnion({
					id: Date.now(),
					title: ''
				})
			});
		},
		updateCriterion: async function (criterion: any, event: Event) {
			const newTitle = (event.target as HTMLInputElement).value;
			if (criterion.title === newTitle) return;

			const decisionSnapshot = await getDoc(decisionRef);
			const decisionCriteria = decisionSnapshot.data()?.criteria;
			const currentCriterion = decisionCriteria.find((c: any) => c.id === criterion.id);
			currentCriterion.title = newTitle;
			await updateDoc(decisionRef, {
				criteria: decisionCriteria
			});
		},
		deleteCriterion: async function (criterion: any) {
			await updateDoc(decisionRef, {
				criteria: arrayRemove(criterion)
			});
		},
		sortCriteria: async function (e: CustomEvent) {
			const newList = e.detail;
			updateDoc(decisionRef, {
				criteria: newList
			});
		}
	};
}
