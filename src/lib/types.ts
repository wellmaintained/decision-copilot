export type Decision = {
	project_id?: string;
	user: string;
	id?: string;
	key?: string;
	title?: string;
	description?: string;
	reversibility?: string;
	options?: DecisionOption[];
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
