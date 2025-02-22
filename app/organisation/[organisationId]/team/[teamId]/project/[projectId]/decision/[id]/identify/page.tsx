"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
  ChevronRight,
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
import { Stakeholder } from "@/lib/domain/Stakeholder";
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
import { DecisionRelationshipsList } from '@/components/decision-relationships-list'

interface StakeholderGroupProps {
  teamName: string;
  stakeholders: Stakeholder[];
  isExpanded: boolean;
  onToggle: () => void;
  selectedStakeholderIds: string[];
  onStakeholderChange: (stakeholderId: string, checked: boolean) => void;
}

function StakeholderGroup({
  teamName,
  stakeholders,
  isExpanded,
  onToggle,
  selectedStakeholderIds,
  onStakeholderChange,
}: StakeholderGroupProps) {
  return (
    <div className="border rounded-lg p-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <span className="text-sm font-medium">{teamName}</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stakeholders.map((stakeholder) => (
              <div
                key={`stakeholder-wrapper-${stakeholder.id}`}
                className="flex items-center space-x-3 pl-2"
              >
                <Checkbox
                  id={`stakeholder-${stakeholder.id}`}
                  checked={selectedStakeholderIds.includes(stakeholder.id)}
                  onCheckedChange={(checked) =>
                    onStakeholderChange(stakeholder.id, checked as boolean)
                  }
                />
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={stakeholder.photoURL} />
                    <AvatarFallback>
                      {stakeholder.displayName
                        ? stakeholder.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <Label
                    htmlFor={`stakeholder-${stakeholder.id}`}
                    className="text-sm font-normal"
                  >
                    {stakeholder.displayName}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DecisionIdentityPage() {
  const params = useParams();
  const decisionId = params.id as string;
  const projectId = params.projectId as string;
  const teamId = params.teamId as string;
  const organisationId = params.organisationId as string;

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
  } = useDecision(decisionId);

  const {
    stakeholders,
    loading: stakeholdersLoading,
  } = useStakeholders();
  const { stakeholderTeams, loading: stakeholderTeamsLoading } =
    useStakeholderTeams();
  const { organisations, loading: organisationsLoading } = useOrganisations();
  const [expandedTeams, setExpandedTeams] = useState<string[]>([teamId]); // Current team is expanded by default
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

  const handleStakeholderChange = (stakeholderId: string, checked: boolean) => {
    if (checked) {
      addStakeholder(stakeholderId);
    } else {
      removeStakeholder(stakeholderId);
    }
  };

  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );
  };

  // Group stakeholders by team
  const stakeholdersByTeam = currentOrg.teams.reduce(
    (acc, team) => {
      const teamStakeholderIds = stakeholderTeams
        .filter((st) => st.teamId === team.id)
        .map((st) => st.stakeholderId);

      const teamStakeholders = stakeholders.filter((s) =>
        teamStakeholderIds.includes(s.id),
      );

      if (teamStakeholders.length > 0) {
        acc[team.id] = {
          name: team.name,
          stakeholders: teamStakeholders,
        };
      }

      return acc;
    },
    {} as Record<string, { name: string; stakeholders: typeof stakeholders }>,
  );

  // Get unique stakeholders for the organization
  const uniqueOrgStakeholders = Array.from(
    new Map(
      Object.values(stakeholdersByTeam)
        .flatMap(({ stakeholders }) => stakeholders)
        .map((stakeholder) => [stakeholder.id, stakeholder]),
    ).values(),
  ).sort((a, b) => a.displayName.localeCompare(b.displayName));

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
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("") || "?"}
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
                                : "?"}
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
            <div className="space-y-4">
              {Object.entries(stakeholdersByTeam)
                .sort(([id1], [id2]) => {
                  // Put the current team first
                  if (id1 === teamId) return -1;
                  if (id2 === teamId) return 1;
                  return 0;
                })
                .map(([teamId, { name, stakeholders }]) => (
                  <StakeholderGroup
                    key={teamId}
                    teamName={name}
                    stakeholders={stakeholders}
                    isExpanded={expandedTeams.includes(teamId)}
                    onToggle={() => toggleTeam(teamId)}
                    selectedStakeholderIds={decision.decisionStakeholderIds}
                    onStakeholderChange={handleStakeholderChange}
                  />
                ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button size="lg" asChild>
          <Link href={`/organisation/${organisationId}/team/${teamId}/project/${projectId}/decision/${decisionId}/process`}>Next</Link>
        </Button>
      </div>
    </>
  );
}
