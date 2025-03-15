"use client";

import { useState } from "react";
import { StakeholderSelectionView } from "@/components/stakeholders/StakeholderSelectionView";

export default function StakeholdersPage() {
  const [selectedStakeholderIds, setSelectedStakeholderIds] = useState<
    string[]
  >([]);
  const [stakeholderSelectionChanges, setStakeholderSelectionChanges] =
    useState<{ stakeholderId: string; selected: boolean }[]>([]);

  const handleStakeholderChange = (
    stakeholderId: string,
    selected: boolean,
  ) => {
    setSelectedStakeholderIds((prev) =>
      selected
        ? [...prev, stakeholderId]
        : prev.filter((id) => id !== stakeholderId),
    );
    setStakeholderSelectionChanges((prev) => [
      ...prev,
      { stakeholderId, selected },
    ]);
  };

  return (
    <div className="container mx-auto py-8">
      <StakeholderSelectionView
        organisationId="9HY1YTkOdqxOTFOMZe8r"
        selectedStakeholderIds={selectedStakeholderIds}
        onStakeholderChange={handleStakeholderChange}
      />

      {/* Debug view */}
      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-medium text-gray-700 mb-2">Debug View</h2>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Stakeholder Selection Changes
        </h3>
        <pre className="text-sm">
          {JSON.stringify(stakeholderSelectionChanges, null, 2)}
        </pre>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Selected Stakeholders
        </h3>
        <pre className="text-sm">
          {JSON.stringify(selectedStakeholderIds, null, 2)}
        </pre>
      </div>
    </div>
  );
}
