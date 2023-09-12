import type { DecisionMethods } from './types';

export const decisionMethods: DecisionMethods = {
	unknown: {
		title: 'Unknown',
		description: 'Unknown decision method',
		speed: 0,
		buyIn: 0,
		steps: [
			{
				type: 'generate',
				icon: '💡',
				who: 'depends on method',
				title: 'Generate options',
				description: 'Options are generated'
			},
			{
				type: 'choose',
				icon: '👉',
				who: 'depends on method',
				title: 'Make a choice',
				description: 'A choice is made'
			}
		]
	},
	autocratic: {
		title: 'Autocratic',
		description: 'A single decider makes a choice and informs all stakeholders',
		speed: 4,
		buyIn: 0,
		steps: [
			{
				type: 'generate',
				icon: '💡',
				who: 'decider',
				title: 'Generate options',
				description: 'Options are generated'
			},
			{
				type: 'choose',
				icon: '👉',
				who: 'decider',
				title: 'Make a choice',
				description: 'Decider makes a choice'
			}
		]
	},
	democratic: {
		title: 'Democratic',
		description: 'Deciders vote on the options.  The option with the most votes is chosen',
		speed: 0,
		buyIn: 4,
		steps: [
			{
				type: 'generate',
				icon: '💡',
				who: 'deciders & advisors',
				title: 'Generate options',
				description: 'Decider generates options'
			},
			{
				type: 'vote',
				who: 'deciders',
				icon: '🗳️',
				title: 'Deciders vote on the options',
				description: 'Deciders vote on the options'
			},
			{
				type: 'choose',
				icon: '👉',
				who: 'deciders',
				title: 'Choose the option',
				description: 'The option with the most votes is chosen'
			}
		]
	},
	consent: {
		title: 'Consent',
		description: 'The proposal is selected if no one has a strong/reasoned objection',
		speed: 3,
		buyIn: 3,
		steps: [
			{
				type: 'generate',
				icon: '💡',
				who: 'deciders & advisors',
				title: 'Generate options',
				description: 'Decider generates options'
			},
			{
				type: 'choose',
				icon: '👉',
				who: 'decider',
				title: 'Decider chooses an option',
				description: 'Decider proposes the chosen option'
			},
			{
				type: 'objection',
				icon: '✋',
				who: 'advisors',
				title: 'Raise objections',
				description: 'Stakeholders raise objections'
			},
			{
				type: 'choose',
				icon: '👉',
				who: 'decider',
				title: 'Consent',
				description: 'Proposal is selected if no one has a strong/reasoned objection'
			}
		]
	}
};
