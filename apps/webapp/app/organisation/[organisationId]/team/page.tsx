'use client'

import React from 'react';
import { InProgressTable } from "@/components/business/in-progress-table"
import ItemForm from "@/components/business/item-form"
import { useOrganisation } from '@/components/business/organisation-switcher'
import { ParticipationChart } from "@/components/business/participation-chart"
import { ProjectDecisionChart } from "@/components/business/project-decisions-chart"
import { useItems } from '@/hooks/useItems';

export default function TeamDashboard() {
  const { selectedOrganisation } = useOrganisation()
  const { items, loading, error, updateItemName } = useItems();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!items) return <p>No items found.</p>;
  if (!selectedOrganisation) return <p>...</p>;

  async function handleNameChange(itemId: string, newValue: string): Promise<void> {
    try {
      await updateItemName(itemId, newValue);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An error occurred while updating the item');
      }
      throw err;
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6"><span className="text-primary bg-gray-100 rounded-md px-2 py-1">{selectedOrganisation.name}</span>&apos;s Dashboard</h1>
      <div className="grid gap-6">
        <div>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id}>
                <ItemForm
                  itemId={item.id}
                  initialName={item.name.value}
                  onSubmit={handleNameChange}
                />
              </li>
            ))}
          </ul>
        </div>
        <InProgressTable />
        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProjectDecisionChart />
          <ParticipationChart />
        </div>
      </div>
    </div>
  )
}

