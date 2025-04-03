"use client";

import { useState, useEffect } from "react";
import { TeamHierarchyTree } from "@/components/TeamHierarchyTree";
import { useAuth } from "@/hooks/useAuth";
import { redirect, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganisation } from "@/components/organisation-switcher";
import { Building2 } from "lucide-react";
import { useOrganisations } from "@/hooks/useOrganisations";
import { StakeholderManagement } from "@/components/StakeholderManagement";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { selectedOrganisation } = useOrganisation();
  const {
    organisations,
    loading: orgsLoading,
    fetchAllOrganisations,
  } = useOrganisations();
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab") ?? "team-hierarchy";
  const [activeTab, setActiveTab] = useState<string>("team-hierarchy");

  useEffect(() => {
    // Fetch all organizations for admin view
    if (isAdmin) {
      fetchAllOrganisations().catch((error) => {
        console.error("Failed to fetch all organisations:", error);
      });
    }
  }, [isAdmin, fetchAllOrganisations]);

  useEffect(() => {
    if (selectedOrganisation) {
      setOrganisationId(selectedOrganisation.id);
    }
  }, [selectedOrganisation]);

  // Set the active tab based on the URL parameter
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  if (authLoading || orgsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    redirect("/login");
    return null;
  }

  // If user is not an admin, redirect to organization page
  if (!isAdmin) {
    redirect("/organisation");
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select
            value={organisationId || ""}
            onValueChange={(value) => setOrganisationId(value)}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select organisation">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>
                    {organisations?.find((org) => org.id === organisationId)
                      ?.name || "Select organisation"}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {organisations?.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{org.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!organisationId ? (
        <Card>
          <CardContent className="flex items-center justify-center min-h-[200px] text-muted-foreground">
            Please select an organization to view and manage its settings
          </CardContent>
        </Card>
      ) : (
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="team-hierarchy">Teams</TabsTrigger>
            <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="team-hierarchy">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Manage the team structure for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamHierarchyTree organisationId={organisationId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stakeholders">
            <Card>
              <CardHeader>
                <CardTitle>Stakeholder Management</CardTitle>
                <CardDescription>
                  Add, edit, and remove stakeholders from your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StakeholderManagement organisationId={organisationId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage users and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>User management functionality will be added soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>
                  Configure organization-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Settings functionality will be added soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
