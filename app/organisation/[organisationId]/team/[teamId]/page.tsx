"use client"

import * as React from "react"
import { useOrganisation } from "@/hooks/useOrganisation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface TeamPageProps {
  params: Promise<{
    organisationId: string
    teamId: string
  }>
}

export default function TeamPage({ params }: TeamPageProps) {
  const { organisationId, teamId } = React.use(params)
  const { organisation } = useOrganisation()
  const team = organisation?.teams.find(t => t.id === teamId)

  if (!team) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Loading team info...</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground mt-2">Manage your team&apos;s projects and decisions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {team.projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href={`/organisation/${organisationId}/team/${team.id}/project/${project.id}`}
                passHref
              >
                <Button variant="outline" className="w-full">
                  View Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {team.projects.length === 0 && (
        <div className="text-center p-12">
          <h3 className="text-lg font-semibold">No projects yet</h3>
          <p className="text-muted-foreground mt-2">Create your first project to get started</p>
        </div>
      )}
    </div>
  )
} 