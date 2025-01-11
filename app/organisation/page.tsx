"use client"

import * as React from "react"
import { useOrganisations } from "@/hooks/useOrganisations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface OrganisationPageProps {
  params: Promise<{
    organisationId: string
  }>
}

export default function OrganisationPage({ params }: OrganisationPageProps) {
  const { organisationId } = React.use(params)
  const { organisations } = useOrganisations()

  return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organisations.map((organisation) => (
          <Card key={organisation.id}>
            <CardHeader>
              <CardTitle>{organisation.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/organisation/${organisation.id}`}
                passHref
              >
                <Button variant="outline" className="w-full">
                  View Organisation
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
  )
}