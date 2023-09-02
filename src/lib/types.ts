export type Decision = {
	project_id?: string;
	user: string;
	id?: string;
	key?: string;
	title?: string;
	description?: string;
	decision?: string;
	cost?: string;
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
