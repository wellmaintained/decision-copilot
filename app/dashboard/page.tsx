'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectDecisionChart } from "@/components/project-decisions-chart"
import { ParticipationChart } from "@/components/participation-chart"
import { InProgressTable } from "@/components/in-progress-table"
import { useState } from "react"

export default function DecisionDashboard() {
  const [activeTeam] = useState({ name: "Development" }) // Default to first team

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6"><span className="text-primary bg-gray-100 rounded-md px-2 py-1">{activeTeam.name}</span>&apos;s decisions</h1>
      <div className="grid gap-6">
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

