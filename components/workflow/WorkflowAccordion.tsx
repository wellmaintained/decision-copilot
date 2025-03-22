'use client';

import React, { useState, useEffect, useCallback } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DecisionWorkflowStep,
  DecisionWorkflowSteps,
  DecisionWorkflowStepsSequence,
  WorkflowNavigator,
  Cost,
  Reversibility,
  DecisionMethod,
} from '@/lib/domain/Decision'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { DecisionRelationshipsList } from '@/components/decision-relationships-list'
import { StakeholderSelectionView } from "@/components/stakeholders/StakeholderSelectionView"
import { useDecision } from "@/hooks/useDecisions"
import { useStakeholders } from "@/hooks/useStakeholders"
import { useStakeholderTeams } from "@/hooks/useStakeholderTeams"
import { useOrganisations } from "@/hooks/useOrganisations"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RoleAssignment } from "@/components/role-assignment"
import { DecisionMethodCard } from "@/components/decision-method-card"
import { Editor } from '@/components/editor'
import { DecisionItemList } from '@/components/decision-item-list'
import { SupportingMaterialsList } from '@/components/supporting-materials-list'
import { STYLE_CLASSES } from './WorkflowAccordionConstants'
import { StepHeader, ProgressBar, NextButton } from './WorkflowAccordionComponents'
import { useToast } from "@/components/ui/use-toast"
import { DecisionSummary } from '@/components/decision-summary'
import { useRouter } from 'next/navigation'

interface WorkflowAccordionProps {
  currentStep?: DecisionWorkflowStep
  onStepChange?: (nextStep: DecisionWorkflowStep) => void
  className?: string
  organisationId?: string
  decisionId?: string
}

export default function WorkflowAccordion({
  currentStep = DecisionWorkflowSteps.IDENTIFY,
  onStepChange,
  className,
  organisationId = "9HY1YTkOdqxOTFOMZe8r",
  decisionId = "KRWdpmQTU2DRR76jrlC4"
}: WorkflowAccordionProps) {
  const currentStepIndex = WorkflowNavigator.getStepIndex(currentStep)
  const [openSteps, setOpenSteps] = useState<string[]>([currentStep.key])
  const [driverOpen, setDriverOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<DecisionMethod | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const {
    decision,
    loading: decisionsLoading,
    updateDecisionTitle,
    updateDecisionDescription,
    updateDecisionCost,
    updateDecisionReversibility,
    updateDecisionDriver,
    updateDecisionMethod,
    updateDecisionOptions,
    updateDecisionCriteria,
    updateDecisionContent,
    addSupportingMaterial,
    removeSupportingMaterial,
    addStakeholder,
    removeStakeholder,
    updateStakeholders,
    publishDecision,
  } = useDecision(decisionId, organisationId)

  const {
    stakeholders,
    loading: stakeholdersLoading,
  } = useStakeholders()
  const { loading: stakeholderTeamsLoading } = useStakeholderTeams()
  const { loading: organisationsLoading } = useOrganisations()

  // Update the open steps when currentStep changes
  useEffect(() => {
    setOpenSteps(prev => {
      if (!prev.includes(currentStep.key)) {
        return [...prev, currentStep.key]
      }
      return prev
    })
  }, [currentStep])

  // Update selected method when decision changes
  useEffect(() => {
    if (decision?.decisionMethod) {
      setSelectedMethod(decision.decisionMethod as DecisionMethod)
    }
  }, [decision])

  const handleMethodSelect = (method: DecisionMethod) => {
    setSelectedMethod(method)
    updateDecisionMethod(method)
  }

  const handleStakeholderChange = (stakeholderId: string | string[], checked: boolean) => {
    if (!decision) return;

    // Handle array of stakeholder IDs for team selection
    if (Array.isArray(stakeholderId) && stakeholderId.length > 0) {
      try {
        // Create an updated list of stakeholders
        let updatedStakeholders = [...decision.stakeholders];
        if (checked) {
          // Add new stakeholders that aren't already in the list
          const existingIds = new Set(updatedStakeholders.map(s => s.stakeholder_id));
          stakeholderId.forEach(id => {
            if (!existingIds.has(id)) {
              updatedStakeholders.push({
                stakeholder_id: id,
                role: "informed"
              });
            }
          });
        } else {
          // Remove stakeholders that are in the list to remove,
          // but preserve the driver stakeholder
          const idsToRemove = new Set(stakeholderId);
          // If driver is in the removal list, show a toast notification
          if (decision.driverStakeholderId && idsToRemove.has(decision.driverStakeholderId)) {
            // Remove driver from the list to prevent the error
            idsToRemove.delete(decision.driverStakeholderId);
          }
          updatedStakeholders = updatedStakeholders.filter(
            s => !idsToRemove.has(s.stakeholder_id)
          );
        }
        // Update all stakeholders in one batch operation
        updateStakeholders(updatedStakeholders);
        return;
      } catch (error) {
        console.error("Error updating stakeholders:", error);
        return;
      }
    }

    // Handle single stakeholder ID
    try {
      // At this point, stakeholderId must be a string
      const id = stakeholderId as string;
      // Check if trying to remove the driver
      if (!checked && id === decision.driverStakeholderId) {
        return;
      }
      if (checked) {
        if (!decision.decisionStakeholderIds.includes(id)) {
          addStakeholder(id);
        }
      } else {
        if (decision.decisionStakeholderIds.includes(id)) {
          removeStakeholder(id);
        }
      }
    } catch (error) {
      console.error(`Error processing stakeholder ${stakeholderId}:`, error);
    }
  };

  const handleAddOption = (option: string) => {
    if (!decision) return;
    const newOptions = [...decision.options.filter(o => o !== ""), option]
    updateDecisionOptions(newOptions)
  }

  const handleUpdateOption = (index: number, option: string) => {
    if (!decision) return;
    const newOptions = [...decision.options]
    newOptions[index] = option
    updateDecisionOptions(newOptions)
  }

  const handleDeleteOption = (index: number) => {
    if (!decision) return;
    const newOptions = decision.options.filter((_, i) => i !== index)
    updateDecisionOptions(newOptions)
  }

  const handleAddCriterion = (criterion: string) => {
    if (!decision) return;
    const newCriteria = [...decision.criteria.filter(c => c !== ""), criterion]
    updateDecisionCriteria(newCriteria)
  }

  const handleUpdateCriterion = (index: number, criterion: string) => {
    if (!decision) return;
    const newCriteria = [...decision.criteria]
    newCriteria[index] = criterion
    updateDecisionCriteria(newCriteria)
  }

  const handleDeleteCriterion = (index: number) => {
    if (!decision) return;
    const newCriteria = decision.criteria.filter((_, i) => i !== index)
    updateDecisionCriteria(newCriteria)
  }

  const handleStepComplete = useCallback((step: DecisionWorkflowStep) => {
    const nextStep = WorkflowNavigator.getNextStep(step);
    if (nextStep && onStepChange) {
      onStepChange(nextStep);
    }
  }, [onStepChange]);

  const renderStepContent = (step: DecisionWorkflowStep) => {
    if (step.key === 'identify' && decision && stakeholders) {
      const uniqueOrgStakeholders = stakeholders.sort((a, b) => a.displayName.localeCompare(b.displayName));

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Label
              htmlFor="driver"
              className="text-base text-muted-foreground min-w-20"
            >
              Driver
            </Label>
            <div className="flex-1">
              <Popover open={driverOpen} onOpenChange={setDriverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={driverOpen}
                    className="justify-between"
                  >
                    {decision.driverStakeholderId ? (
                      (() => {
                        const driverStakeholder = uniqueOrgStakeholders.find(
                          (s) => s.id === decision.driverStakeholderId,
                        );
                        return (
                          <>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={driverStakeholder?.photoURL}
                                />
                                <AvatarFallback>
                                  {driverStakeholder?.displayName
                                    ? driverStakeholder.displayName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                    : "👤"}
                                </AvatarFallback>
                              </Avatar>
                              {driverStakeholder?.displayName}
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                          </>
                        );
                      })()
                    ) : (
                      <>
                        <span>Select driver...</span>
                        <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search stakeholders..." />
                    <CommandEmpty>No stakeholder found.</CommandEmpty>
                    <CommandGroup>
                      {uniqueOrgStakeholders.map((stakeholder) => (
                        <CommandItem
                          key={stakeholder.id}
                          onSelect={() => {
                            updateDecisionDriver(stakeholder.id);
                            setDriverOpen(false);
                          }}
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={stakeholder.photoURL} />
                            <AvatarFallback>
                              {stakeholder.displayName
                                ? stakeholder.displayName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : "👤"}
                            </AvatarFallback>
                          </Avatar>
                          {stakeholder.displayName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label
              htmlFor="title"
              className="text-base text-muted-foreground min-w-20"
            >
              Title
            </Label>
            <Input
              id="title"
              placeholder="What decision needs to be made?"
              defaultValue={decision.title}
              onBlur={(e) => updateDecisionTitle(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="space-y-6">
            <DecisionRelationshipsList
              relationshipType="supersedes"
              fromDecision={decision}
              title="Supersedes Decision(s)"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base text-muted-foreground">Details</Label>
            <div className="border rounded-md">
              <textarea
                className="w-full p-4 min-h-[200px] bg-background resize-none focus:outline-none"
                defaultValue={decision.description}
                onBlur={(e) =>
                  updateDecisionDescription(e.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base text-muted-foreground">Cost</Label>
              <span className="text-sm text-muted-foreground">
                - how much will it cost (in effort, time or money) to implement?
              </span>
            </div>
            <RadioGroup
              defaultValue={decision.cost}
              className="flex gap-4"
              onValueChange={(value) =>
                updateDecisionCost(value as Cost)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="cost-low" className="h-5 w-5" />
                <Label htmlFor="cost-low">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="medium"
                  id="cost-medium"
                  className="h-5 w-5"
                />
                <Label htmlFor="cost-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="high"
                  id="cost-high"
                  className="h-5 w-5"
                />
                <Label htmlFor="cost-high">High</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base text-muted-foreground">
                Reversibility
              </Label>
              <span className="text-sm text-muted-foreground">
                - like choosing a
              </span>
            </div>
            <RadioGroup
              defaultValue={decision.reversibility}
              className="flex gap-4"
              onValueChange={(value) =>
                updateDecisionReversibility(value as Reversibility)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hat" id="rev-hat" className="h-5 w-5" />
                <Label htmlFor="rev-hat">Hat</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="haircut"
                  id="rev-haircut"
                  className="h-5 w-5"
                />
                <Label htmlFor="rev-haircut">Haircut</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="tattoo"
                  id="rev-tattoo"
                  className="h-5 w-5"
                />
                <Label htmlFor="rev-tattoo">Tattoo</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    }

    if (step.key === 'stakeholders' && decision && stakeholders) {
      return (
        <div className="space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Label className="text-base text-muted-foreground">
                Stakeholders
              </Label>
              <span className="text-sm text-muted-foreground">
                - who has an interest in - or is impacted by - this decision?
              </span>
            </div>
            <StakeholderSelectionView
              organisationId={organisationId}
              selectedStakeholderIds={decision.decisionStakeholderIds}
              onStakeholderChange={handleStakeholderChange}
              driverStakeholderId={decision.driverStakeholderId}
            />
          </div>
        </div>
      )
    }

    if (step.key === 'method' && decision) {
      return (
        <div className="space-y-6">
          <RoleAssignment decision={decision} />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold">Decision making method</CardTitle>
              <CardDescription className="text-sm">
                Given the assigned roles assigned; one of the following methods could be used:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <DecisionMethodCard
                  title="Accountable Individual"
                  description="A single decider makes a choice and informs all stakeholders"
                  speedValue={90}
                  buyInValue={10}
                  isSelected={selectedMethod === "accountable_individual"}
                  onSelect={() => handleMethodSelect("accountable_individual")}
                />
                <DecisionMethodCard
                  title="Consent"
                  description="The proposal is selected if no one has a strong/reasoned objection"
                  speedValue={80}
                  buyInValue={90}
                  isSelected={selectedMethod === "consent"}
                  onSelect={() => handleMethodSelect("consent")}
                />
              </div>
            </CardContent>
          </Card>

        </div>
      )
    }

    if (step.key === 'choose' && decision) {
      return (
        <div className="space-y-8">
          <DecisionRelationshipsList
            relationshipType="blocked_by"
            fromDecision={decision}
            title="Blocked By Decision(s)"
          />

          <DecisionItemList
            title="Options"
            items={decision.options}
            onAdd={handleAddOption}
            onUpdate={handleUpdateOption}
            onDelete={handleDeleteOption}
            placeholder="Enter new option"
          />

          <DecisionItemList
            title="Criteria"
            items={decision.criteria}
            onAdd={handleAddCriterion}
            onUpdate={handleUpdateCriterion}
            onDelete={handleDeleteCriterion}
            placeholder="Enter new criterion"
          />

          <div className="space-y-4">
            <h2 className="text-xl text-muted-foreground">Decision</h2>
            <Editor 
              content={decision.decision || ""}
              onChange={(content) => updateDecisionContent(content)}
            />
          </div>

          <SupportingMaterialsList 
            materials={decision.supportingMaterials}
            onAdd={addSupportingMaterial}
            onRemove={removeSupportingMaterial}
          />
        </div>
      )
    }

    if (step.key === 'publish' && decision) {
      return (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-xl text-muted-foreground">Publish Decision</Label>
              <span className="text-sm text-muted-foreground">
                - review and publish your decision to inform all stakeholders
              </span>
            </div>
            
            <DecisionSummary 
              decision={decision}
              stakeholders={stakeholders}
              compact
            />

            <Button 
              variant="default"
              className="px-8" 
              onClick={async () => {
                try {
                  await publishDecision();
                  toast({
                    title: "Decision Published",
                    description: "The decision has been successfully published and <TODO>stakeholders will be notified</TODO>.",
                  });
                  handleStepComplete(step);
                  // Only redirect on successful publish
                  router.push(`/organisation/${decision.organisationId}`);
                } catch (error) {
                  toast({
                    variant: "destructive",
                    title: "Failed to Publish Decision",
                    description: error instanceof Error ? error.message : "An unexpected error occurred",
                  });
                  // Don't redirect or complete step on error
                }
              }}
            >
              Publish
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{step.label} Content</h3>
        <p className="text-muted-foreground">
          This is placeholder content for the {step.label.toLowerCase()} step. 
          In the actual implementation, this will contain the specific form or content for this step.
        </p>
      </div>
    )
  }

  if (decisionsLoading || stakeholdersLoading || stakeholderTeamsLoading || organisationsLoading) {
    return <div>Loading...</div>
  }

  return (
    <Accordion
      type="multiple"
      value={openSteps}
      onValueChange={setOpenSteps}
      className={cn("w-full space-y-2", className)}
    >
      {DecisionWorkflowStepsSequence.map((step, index) => {
        const isCompleted = index < currentStepIndex
        const isCurrent = step.key === currentStep.key
        const isDisabled = index > currentStepIndex

        return (
          <AccordionItem
            key={step.key}
            value={step.key}
            className={cn(
              STYLE_CLASSES.accordionItem.base,
              isDisabled && STYLE_CLASSES.accordionItem.disabled,
              isCurrent && STYLE_CLASSES.accordionItem.current,
              isCompleted && STYLE_CLASSES.accordionItem.completed
            )}
            disabled={isDisabled}
          >
            <AccordionTrigger 
              className="px-4 hover:no-underline"
              aria-label={`${step.label} step - ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
            >
              <StepHeader step={step} isCurrent={isCurrent} />
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {renderStepContent(step)}
              {isCurrent && step.key !== 'publish' && (
                <div className="flex justify-between items-center mt-8">
                  <NextButton 
                    onComplete={() => {
                      handleStepComplete(step);
                    }}
                    stepLabel={step.label} 
                  />
                  <ProgressBar 
                    currentStepIndex={currentStepIndex} 
                    totalSteps={DecisionWorkflowStepsSequence.length} 
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
} 