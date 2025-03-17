# Decision Workflow UX Redesign

## Overview

The Decision Copilot application is being enhanced with a single-page workflow that replaces the current multi-page approach. This redesign addresses user feedback that indicated difficulty in referring to previously entered information while progressing through the decision-making steps.

## Design Goals

- Maintain the guided step-by-step workflow
- Allow users to easily reference previous information
- Reduce cognitive load by keeping context visible
- Improve performance through lazy-loading techniques
- Preserve the domain model's workflow step concept

## User Experience

### Current Issues

- Users need to navigate between pages to reference previous information
- Loss of context when moving between workflow steps
- "Back" navigation disrupts the workflow

### New Approach

The redesigned workflow will:

1. Display all steps on a single page with horizontal progress indicator
2. Use accordions to expand/collapse each section
3. Only load content for visible sections to maintain performance
4. Automatically expand the current section based on decision state
5. Allow users to manually expand previous sections for reference

## UI Components

### 1. Horizontal Workflow Progress

A horizontal stepper showing all workflow steps:
- Identify
- Method
- Options
- Choose
- Publish

This component will:
- Highlight the current active step
- Show completed steps with checkmarks or filled icons
- Connect steps with lines that change color based on completion
- Allow clicking on steps to expand their corresponding sections

### 2. Accordion Sections

Each workflow step is contained in an accordion section that can expand or collapse:
- Only one section is expanded at a time
- Completed sections show a summary when collapsed
- Sections are lazy-loaded when expanded
- "Next" buttons control section progression

### 3. Section Content

Content within each section remains the same as the current implementation, preserving all functionality while improving the navigation experience.

## Implementation Steps

1. **Create Base Component Structure**
   - Implement horizontal workflow progress component
   - Set up accordion container for sections
   - Define state management for expansion/collapse

2. **Implement State Management**
   - Use `Decision.currentStep` to determine initial expansion state
   - Track completed sections based on decision state
   - Implement expansion logic that respects workflow progression

3. **Implement Lazy Loading**
   - Only render content for expanded sections
   - Load section content on first expansion
   - Track which sections have been loaded

4. **Implement Section Components**
   - Refactor existing page components into section components
   - Ensure all functionality works within the accordion structure
   - Implement proper state lifting to maintain data consistency

5. **Add Summary Views**
   - Create condensed summaries for collapsed sections
   - Show key information to provide context at a glance

6. **Styling and Polish**
   - Ensure consistent styling across the workflow
   - Add transitions for smooth section expansion/collapse
   - Optimize mobile view for the horizontal stepper

7. **Testing**
   - Test performance impact of lazy loading
   - Verify workflow progression logic
   - Ensure all functionality from previous implementation is preserved

## Technical Implementation

```tsx
// Key state variables
const [expandedSection, setExpandedSection] = useState<number | null>(null);
const [completedSections, setCompletedSections] = useState<number[]>([]);
const [loadedSections, setLoadedSections] = useState<number[]>([]);

// Initialize based on decision.currentStep
useEffect(() => {
  if (decision) {
    const currentStepIndex = DecisionWorkflowSteps.findIndex(
      step => step.label === decision.currentStep.label
    );
    setCompletedSections(Array.from({ length: currentStepIndex }, (_, i) => i));
    setExpandedSection(currentStepIndex);
    setLoadedSections([currentStepIndex]);
  }
}, [decision]);

// Lazy loading logic
const shouldLoadSection = (sectionIndex: number) => {
  return loadedSections.includes(sectionIndex);
};

// Section expansion handler
const handleExpandSection = (sectionIndex: number) => {
  if (completedSections.includes(sectionIndex) || 
      sectionIndex === Math.min(completedSections.length, DecisionWorkflowSteps.length - 1)) {
    
    if (!loadedSections.includes(sectionIndex)) {
      setLoadedSections([...loadedSections, sectionIndex]);
    }
    
    setExpandedSection(sectionIndex);
  }
};
```

## Benefits

- **Improved User Experience**: Users can easily reference previous steps without losing context
- **Maintained Workflow Structure**: Preserves the guided approach of the current implementation
- **Performance Optimization**: Lazy loading prevents unnecessary content rendering
- **Consistent Data Model**: Leverages existing domain model's step tracking

## Considerations

- Initial implementation complexity is higher than the multi-page approach
- Need to ensure UI state properly reflects the underlying decision state
- Mobile view may require special handling for the horizontal stepper
- Need to manage form validation consistently across accordions

## Next Steps

1. Create a prototype of the horizontal progress component
2. Implement the accordion structure with placeholder content
3. Test the lazy loading performance
4. Gradually migrate each section from the existing pages
5. Add comprehensive tests to ensure consistent behavior 