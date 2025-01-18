"use client";

import { useState } from "react";

import { Organisation } from "@/lib/domain/Organisation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Check,
  X,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface OrgSectionProps {
  organisations: Organisation[];
  setOrganisations: (orgs: Organisation[]) => void;
  handleAddTeamToOrg: (orgId: string) => void;
}

interface TreeItem {
  id: string;
  name: string;
  type: "org" | "team";
  parentId?: string;
  isExpanded?: boolean;
  level: number;
}

export function OrgSection({
  organisations,
  setOrganisations,
  handleAddTeamToOrg,
}: OrgSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());

  // Convert organisations and teams into a flat tree structure
  const treeItems: TreeItem[] = [
    ...organisations.map((org) => ({
      id: org.id,
      name: org.name,
      type: "org" as const,
      level: 0,
      isExpanded: expandedOrgs.has(org.id),
    })),
    ...organisations.flatMap((org) =>
      org.teams.map((team) => ({
        id: team.id,
        name: team.name,
        type: "team" as const,
        parentId: org.id,
        level: 1,
      })),
    ),
  ];

  // Sort items so teams appear under their organisations
  const sortedItems = treeItems.sort((a, b) => {
    // First, compare the parent IDs or org IDs
    const aParentId = a.parentId || a.id;
    const bParentId = b.parentId || b.id;

    if (aParentId !== bParentId) {
      return aParentId.localeCompare(bParentId);
    }

    // If they have the same parent (or are both orgs), sort by type then name
    if (a.type !== b.type) {
      return a.type === "org" ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });

  const handleSave = (id: string, type: "org" | "team") => {
    //   if (type === 'org') {
    //     setOrganisations(
    //       organisations.map((org) =>
    //         org.id === id ? { ...org, name: editingName } : org
    //       )
    //     )
    //   } else {
    //     setTeams(
    //       teams.map((team) =>
    //         team.id === id ? { ...team, name: editingName } : team
    //       )
    //     )
    //   }
    setEditingId(null);
  };

  const handleCancel = (id: string, type: "org" | "team") => {
    //   if (type === 'org') {
    //     if (!organisations.find((org) => org.id === id)?.name) {
    //       setOrganisations(organisations.filter((org) => org.id !== id))
    //     }
    //   } else {
    //     if (!teams.find((team) => team.id === id)?.name) {
    //       setTeams(teams.filter((team) => team.id !== id))
    //     }
    //   }
    setEditingId(null);
  };

  const handleDelete = (id: string, type: "org" | "team") => {
    //   if (type === 'org') {
    //     setOrganisations(organisations.filter((org) => org.id !== id))
    //     // Delete all teams belonging to this org
    //     setTeams(teams.filter((team) => team.organisationId !== id))
    //   } else {
    //     setTeams(teams.filter((team) => team.id !== id))
    //   }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedOrgs(newExpanded);
  };

  // Filter items to show based on expanded state
  const visibleItems = sortedItems.filter((item) => {
    if (item.type === "org") return true;
    return item.parentId && expandedOrgs.has(item.parentId);
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <div style={{ width: `${item.level * 24}px` }} />
                {item.type === "org" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => toggleExpand(item.id)}
                  >
                    {item.isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {item.type === "team" && <div className="w-4" />}
                {editingId === item.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder={`${item.type === "org" ? "Organisation" : "Team"} name`}
                    autoFocus
                  />
                ) : (
                  <div
                    className={cn(
                      "cursor-pointer hover:text-primary",
                      item.type === "team" && "text-muted-foreground",
                    )}
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingName(item.name);
                    }}
                  >
                    {item.name || "(Click to edit)"}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {editingId === item.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSave(item.id, item.type)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCancel(item.id, item.type)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    {item.type === "org" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddTeamToOrg(item.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id, item.type)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
