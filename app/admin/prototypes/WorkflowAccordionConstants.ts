export type StepKey = 'identify' | 'stakeholders' | 'method' | 'choose' | 'publish';

export const STEP_DESCRIPTIONS: Record<StepKey, string> = {
  identify: "identifies what the decision is about",
  stakeholders: "selects which stakeholders should be involved in / aware of the decision",
  method: "assigns roles and pick a decision making method",
  choose: "makes a choice",
  publish: "informs stakeholders of the decision"
} as const;

export const STYLE_CLASSES = {
  accordionItem: {
    base: "border rounded-lg transition-all duration-200",
    disabled: "opacity-50",
    current: "ring-2 ring-primary ring-offset-2",
    completed: "bg-emerald-50/50"
  },
  stepIcon: {
    base: "h-6 w-6",
    current: "text-primary"
  }
} as const; 