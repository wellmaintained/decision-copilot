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
import Link from "next/link";
import { redirect } from "next/navigation";

export default function OrganisationPage() {
  const { organisations, loading, error } = useOrganisations();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Auto-redirect if user only has access to one organisation
  if (organisations.length === 1) {
    redirect(`/organisation/${organisations[0].id}`);
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Organisations</CardTitle>
        <CardDescription>
          Select an organisation to view its details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {organisations.map((org) => (
            <li key={org.id}>
              <Link
                href={`/organisation/${org.id}`}
                className="text-primary hover:underline text-lg"
              >
                {org.name}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
