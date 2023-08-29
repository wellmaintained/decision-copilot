export type Decision = {
	project_id?: string;
	user: string;
	id?: string;
	key?: string;
	title?: string;
	description?: string;
	reversibility?: string;
	options?: DecisionOption[];
	stakeholders?: string[];
};

export type DecisionOption = {
	id?: string;
	title?: string;
	url?: string;
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
