"use client";

import { useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useOrganisationDecisions } from "@/hooks/useOrganisationDecisions";
import { useAuth } from "@/hooks/useAuth";

export default function DecisionPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const organisationId = (params?.organisationId as string) || "";
  const { createDecision } = useOrganisationDecisions(organisationId);
  const hasCreatedDecision = useRef(false);

  useEffect(() => {
    if (!params?.organisationId) return;

    if (user) {
      // we need to wait until the logged in user is available
      if (!hasCreatedDecision.current) {
        // we only want to run createDecision once
        hasCreatedDecision.current = true;
        createDecision().then((decision) => {
          router.push(`${decision.id}/edit`);
        });
      }
    }
  }, [user, createDecision, router, params?.organisationId]);

  if (!params?.organisationId) {
    return <div>Invalid organisation ID</div>;
  }

  return <div>Creating decision...</div>;
}
