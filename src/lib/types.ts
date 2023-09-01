export type Decision = {
	project_id?: string;
	user: string;
	id?: string;
	key?: string;
	title?: string;
	description?: string;
	decision?: string;
	reversibility?: string;
	options?: DecisionOption[];
	criteria?: DecisionCriteria[];
	stakeholders?: string[];
	createdAt?: Date;
	updatedAt?: Date;
};

export type DecisionOption = {
	id: string;
	title?: string;
};

export type DecisionCriteria = {
	id: string;
	title?: string;
};

export type DecisionContext = {
	subscribe: (fn: (value: Decision) => void) => () => void;
	decisionId: string;
	updateDecisionField: (field: string, event: Event) => void;
	changeStakeholder: (event: Event) => void;
	handleDescriptionUpdate: (e: CustomEvent) => void;
	handleDecisionUpdate: (e: CustomEvent) => void;
};

export type Project = {
	id?: string;
	name?: string;
};

export type User = {
	id: string;
	email: string;
	displayName: string;
	photoURL: URL;
};
