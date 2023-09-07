import { firestore } from '$lib/firebase';
import {
	DocumentReference,
	arrayRemove,
	arrayUnion,
	collection,
	doc,
	documentId,
	getDoc,
	getDocs,
	query,
	serverTimestamp,
	updateDoc,
	where
} from 'firebase/firestore';
import type {
	Decision,
	DecisionCriteria,
	DecisionOption,
	DecisionStakeholder,
	User
} from './types';
import { docStore } from 'sveltefire';
interface DocStore<T> {
	subscribe: (cb: (value: T | null) => void) => void | (() => void);
	ref: DocumentReference<T> | null;
	id: string;
}

export type DecisionRepo = {
	decisionId: string;
	latestDecisionData: DocStore<Decision>;
	fetchDecisionStakeholderData: (
		decisionStakeholder: DecisionStakeholder[] | undefined
	) => Promise<User[]>;
	updateDecisionField: (field: string, value: any) => Promise<void>;
	changeStakeholder: (event: Event) => Promise<void>;
	updateStakeholderRole: (stakeholder_id: string, role: string) => Promise<void>;
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
		fetchDecisionStakeholderData: async function (
			decisionStakeholder: DecisionStakeholder[] | undefined
		): Promise<User[]> {
			const decisionStakeholderIds = decisionStakeholder?.map((o) => o.stakeholder_id) ?? [
				'ignore'
			];
			const decisionStakeholdersResult = await getDocs(
				query(
					collection(firestore, 'stakeholders'),
					where(documentId(), 'in', decisionStakeholderIds)
				)
			);
			if (!decisionStakeholdersResult.empty) {
				return decisionStakeholdersResult.docs.map((doc) => {
					return {
						id: doc.id,
						...doc.data()
					} as User;
				});
			} else {
				return [];
			}
		},
		updateDecisionField: async function (field: string, value) {
			await updateDoc(decisionRef, {
				[field]: value,
				updatedAt: serverTimestamp()
			});
		},
		changeStakeholder: async function (event: Event) {
			const stakeholder_id = (event.target as HTMLInputElement).value;
			const isChecked = (event.target as HTMLInputElement).checked;
			const decisionSnapshot = await getDoc(decisionRef);
			const decisionStakeholders = decisionSnapshot.data()?.stakeholders ?? [];
			const currentStakeholder = decisionStakeholders?.find(
				(o: DecisionStakeholder) => o.stakeholder_id === stakeholder_id
			);
			if (!currentStakeholder && isChecked) {
				// add stakeholder to decision
				decisionStakeholders.push({ stakeholder_id: stakeholder_id });
			} else if (currentStakeholder && !isChecked) {
				// remove stakeholder from decision
				const index = decisionStakeholders.indexOf(currentStakeholder);
				decisionStakeholders.splice(index, 1);
			}

			await updateDoc(decisionRef, {
				stakeholders: decisionStakeholders,
				updatedAt: serverTimestamp()
			});
		},
		updateStakeholderRole: async function (stakeholder_id: string, role: string) {
			const decisionSnapshot = await getDoc(decisionRef);
			const decisionStakeholders = decisionSnapshot.data()?.stakeholders;
			const currentStakeholder = decisionStakeholders.find(
				(o: DecisionStakeholder) => o.stakeholder_id === stakeholder_id
			);
			currentStakeholder.role = role;
			await updateDoc(decisionRef, {
				stakeholders: decisionStakeholders,
				updatedAt: serverTimestamp()
			});
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
