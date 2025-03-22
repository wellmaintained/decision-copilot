'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOrganisation } from '@/components/organisation-switcher';
import { useOrganisationDecisions } from '@/hooks/useOrganisationDecisions';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText, Users, Clock, Search, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { WorkflowProgress } from '@/components/ui/workflow-progress';
import { Decision, WorkflowNavigator } from '@/lib/domain/Decision';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DecisionCardProps {
  decision: Decision;
  showEditButton?: boolean;
  organisationId: string;
}

type SortOrder = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

export default function OrganisationDecisionsList() {
  const params = useParams();
  const organisationId = params.organisationId as string;
  const { selectedOrganisation } = useOrganisation();
  const { decisions, loading, error, deleteDecision } = useOrganisationDecisions(organisationId);
  
  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Create debounced search handler using useCallback
  const debouncedSearch = useCallback((value: string) => {
    if (value.length >= 3 || value.length === 0) {
      setDebouncedSearchQuery(value);
    }
  }, []);

  // Handle search input changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, debouncedSearch]);

  // Filter and sort decisions
  const filteredAndSortedDecisions = useMemo(() => {
    if (!decisions) return [];

    let filtered = decisions;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Apply search filter (if at least 3 characters or empty)
    if (debouncedSearchQuery.length >= 3) {
      filtered = filtered.filter(d => 
        d.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return (b.updatedAt || b.createdAt).getTime() - (a.updatedAt || a.createdAt).getTime();
        case 'oldest':
          return (a.updatedAt || a.createdAt).getTime() - (b.updatedAt || b.createdAt).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [decisions, statusFilter, debouncedSearchQuery, sortOrder]);

  // Group filtered and sorted decisions by status
  const groupedDecisions = useMemo(() => {
    const groups = {
      in_progress: [] as Decision[],
      blocked: [] as Decision[],
      published: [] as Decision[],
      superseded: [] as Decision[]
    };

    filteredAndSortedDecisions.forEach(decision => {
      if (decision.status in groups) {
        groups[decision.status as keyof typeof groups].push(decision);
      }
    });

    return groups;
  }, [filteredAndSortedDecisions]);

  if (loading) return <div className="p-6">Loading decisions...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading decisions: {error.message}</div>;
  if (!selectedOrganisation) return <p>...</p>;

  const handleDelete = async (decisionId: string) => {
    try {
      await deleteDecision(decisionId);
      console.log('Decision deleted:', decisionId);
    } catch (error) {
      console.error('Error deleting decision:', error);
    }
  };

  const DecisionCard = ({ decision, showEditButton = true, organisationId }: DecisionCardProps) => {
    return (
      <div
        key={decision.id}
        className="flex items-start justify-between p-4 rounded-lg border bg-white"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900">{decision.title}</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {decision.cost}
            </span>
          </div>
          {decision.decision && (
            <p className="text-sm text-gray-600 mb-2">
              Decision: {decision.decision}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <WorkflowProgress currentStep={WorkflowNavigator.getStepIndex(decision.currentStep) + 1} />
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{decision.stakeholders.length} stakeholders</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Updated {decision.updatedAt?.toLocaleDateString() || decision.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {showEditButton ? (
            <Button variant="ghost" size="icon" title="Edit decision" asChild>
              <Link href={`/organisation/${organisationId}/decision/${decision.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" title="View decision" asChild>
              <Link href={`/organisation/${organisationId}/decision/${decision.id}/view`}>
                <FileText className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            title="Delete decision"
            onClick={() => handleDelete(decision.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const DecisionGroup = ({ title, decisions }: { title: string, decisions: Decision[] }) => {
    if (statusFilter !== 'all' && !decisions.length) return null;
    
    return (
      <div>
        <h2 className="text-lg font-medium mb-4">{title}</h2>
        <div className="space-y-4">
          {decisions.map((decision) => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              showEditButton={decision.status === 'in_progress' || decision.status === 'blocked'}
              organisationId={organisationId}
            />
          ))}
          {statusFilter === 'all' && !decisions.length && (
            <p className="text-gray-500">No {title.toLowerCase()} decisions</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">
        <span className="text-primary bg-gray-100 rounded-md px-2 py-1">{selectedOrganisation.name}</span>&apos;s Decisions
      </h1>

      {/* Filters and Search Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="superseded">Superseded</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Newest First
              </div>
            </SelectItem>
            <SelectItem value="oldest">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Oldest First
              </div>
            </SelectItem>
            <SelectItem value="title-asc">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Title A-Z
              </div>
            </SelectItem>
            <SelectItem value="title-desc">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Title Z-A
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-8">
        {filteredAndSortedDecisions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No decisions found matching your criteria
          </div>
        ) : (
          <>
            <DecisionGroup title="In Progress" decisions={groupedDecisions.in_progress} />
            <DecisionGroup title="Blocked" decisions={groupedDecisions.blocked} />
            <DecisionGroup title="Published" decisions={groupedDecisions.published} />
            <DecisionGroup title="Superseded" decisions={groupedDecisions.superseded} />
          </>
        )}
      </div>
    </div>
  );
}

