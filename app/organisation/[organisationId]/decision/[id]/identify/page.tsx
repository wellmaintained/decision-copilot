"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Bold,
  Italic,
  Heading,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Book,
  Maximize,
  HelpCircle,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDecision } from "@/hooks/useDecisions";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useStakeholderTeams } from "@/hooks/useStakeholderTeams";
import { useOrganisations } from "@/hooks/useOrganisations";
import {
  Cost,
  Reversibility,
} from "@/lib/domain/Decision";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DecisionRelationshipsList } from '@/components/decision-relationships-list';
import { StakeholderSelectionView } from "@/components/stakeholders/StakeholderSelectionView";
import { useToast } from "@/components/ui/use-toast";

export default function DecisionIdentityPage() {
  const params = useParams();
  const decisionId = params.id as string;
  const organisationId = params.organisationId as string;
  const { toast } = useToast();

  const {
    decision,
    loading: decisionsLoading,
    error: decisionsError,
    updateDecisionTitle,
    updateDecisionDescription,
    updateDecisionCost,
    updateDecisionReversibility,
    updateDecisionDriver,
    addStakeholder,
    removeStakeholder,
    updateStakeholders,
  } = useDecision(decisionId, organisationId);

  const {
    stakeholders,
    loading: stakeholdersLoading,
  } = useStakeholders();
  const { loading: stakeholderTeamsLoading } = useStakeholderTeams();
  const { organisations, loading: organisationsLoading } = useOrganisations();
  
  const [driverOpen, setDriverOpen] = useState(false);

  const currentOrg = organisations?.find((org) => org.id === organisationId);

  if (
    decisionsLoading ||
    stakeholdersLoading ||
    stakeholderTeamsLoading ||
    organisationsLoading
  ) {
    return <div>Loading...</div>
  }

  if (decisionsError) {
    return <div>Error: {(decisionsError)?.message}</div>
  }

  if (!decision || !currentOrg) {
    return <div>Decision or organisation not found</div>;
  }

  const handleStakeholderChange = (stakeholderId: string | string[], checked: boolean) => {
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
            // Show a user-friendly toast notification
            toast({
              title: "Driver cannot be removed",
              description: "The driver stakeholder must remain part of the decision.",
              variant: "destructive",
              icon: <AlertCircle className="h-5 w-5" />
            });
            // If we were only trying to remove the driver, exit early
            if (idsToRemove.size === 0) return;
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
        toast({
          title: "Error updating stakeholders",
          description: "There was a problem updating the stakeholders list.",
          variant: "destructive"
        });
        return;
      }
    }

    // Handle single stakeholder ID
    try {
      // At this point, stakeholderId must be a string
      const id = stakeholderId as string;
      // Check if trying to remove the driver
      if (!checked && id === decision.driverStakeholderId) {
        toast({
          title: "Driver cannot be removed",
          description: "The driver stakeholder must remain part of the decision.",
          variant: "destructive",
          icon: <AlertCircle className="h-5 w-5" />
        });
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
      toast({
        title: "Error updating stakeholder",
        description: "There was a problem updating this stakeholder.",
        variant: "destructive"
      });
    }
  };

  // Get unique stakeholders for the organization
  const uniqueOrgStakeholders = stakeholders.sort((a, b) => a.displayName.localeCompare(b.displayName));

  return (
    <>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          Identify the Decision
        </h1>
        <p className="text-lg text-muted-foreground">
          Capture information about the decision being made and who is involved
        </p>
      </div>

      <Card className="p-8 space-y-8">
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
                            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                          </>
                        );
                      })()
                    ) : (
                      <>
                        <span>Select driver...</span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
              <div className="flex items-center gap-1 p-2 border-b">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Heading className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-2" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Quote className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-2" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-2" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Book className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Maximize className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
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
      </Card>

      <div className="flex justify-end pt-4">
        <Button size="lg" asChild>
          <Link href={`/organisation/${organisationId}/decision/${decisionId}/process`}>Next</Link>
        </Button>
      </div>
    </>
  );
}
