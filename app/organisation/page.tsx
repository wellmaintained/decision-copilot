"use client";

import * as React from "react";
import { useOrganisations } from "@/hooks/useOrganisations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useStakeholderTeams } from "@/hooks/useStakeholderTeams";
import { OrgSection } from "@/components/org-section";
import { StakeholderSection } from "@/components/stakeholder-section";
import { Organisation } from "@/lib/domain/Organisation";
import { Team } from "@/lib/domain/Team";

interface OrganisationPageProps {
  params: Promise<{
    organisationId: string;
  }>;
}

export default function OrganisationPage({ params }: OrganisationPageProps) {
  const { organisations, setOrganisations, addOrganisation } =
    useOrganisations();
  const { stakeholders, addStakeholder, updateStakeholder, removeStakeholder } = useStakeholders();
  const { stakeholderTeams, setStakeholderTeams, addStakeholderTeam, removeStakeholderTeam } =
    useStakeholderTeams();

  const handleAddOrg = () => {
    addOrganisation({
      id: "new",
      name: "new Org",
      teams: [],
    });
  };

  const handleAddStakeholder = () => {
    addStakeholder({
      id: "new",
      displayName: "",
      email: "",
      photoURL: "",
    });
  };

  const handleAddTeamToOrg = (orgId: string) => {
    setOrganisations(
      organisations.map((org) => {
        if (org.id === orgId) {
          return Organisation.create({
            ...org,
            teams: [
              ...org.teams,
              Team.create({
                id: "new",
                name: "new Team",
                projects: [],
                organisation: {
                  id: org.id,
                  name: org.name,
                },
              }),
            ],
          });
        }
        return org;
      }),
    );
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">
              Organisations & Teams
            </CardTitle>
            <CardDescription>
              Manage your organization and team structure
            </CardDescription>
          </div>
          <Button onClick={handleAddOrg}>
            <Plus className="w-4 h-4 mr-2" />
            Add Organisation
          </Button>
        </CardHeader>
        <CardContent>
          <OrgSection
            organisations={organisations}
            setOrganisations={setOrganisations}
            handleAddTeamToOrg={handleAddTeamToOrg}
          />
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">Stakeholders</CardTitle>
            <CardDescription>
              Manage stakeholders and their team memberships
            </CardDescription>
          </div>
          <Button onClick={handleAddStakeholder}>
            <Plus className="w-4 h-4 mr-2" />
            Add Stakeholder
          </Button>
        </CardHeader>
        <CardContent>
          <StakeholderSection
            stakeholders={stakeholders}
            updateStakeholder={updateStakeholder}
            removeStakeholder={removeStakeholder}
            stakeholderTeams={stakeholderTeams}
            setStakeholderTeams={setStakeholderTeams}
            organisations={organisations}
            addStakeholderTeam={addStakeholderTeam}
            removeStakeholderTeam={removeStakeholderTeam}
          />
        </CardContent>
      </Card>
    </div>
  );
}
