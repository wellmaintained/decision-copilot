"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RoleAssignment } from "@/components/role-assignment"
import { DecisionMethodCard } from "@/components/decision-method-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { useParams } from 'next/navigation'

const initialPeople = [
  {
    id: "1",
    name: "David Laing",
    image: "/placeholder.svg",
    role: "decider" as const,
  },
  {
    id: "2",
    name: "Scott Muc",
    image: "/placeholder.svg",
    role: "advisor" as const,
  },
  // Add other people here...
] as const

type Person = {
  id: string;
  name: string;
  image: string;
  role: "decider" | "advisor" | "observer";
}

export default function DecisionProcess() {
  const params = useParams()
  const decisionId = params.id as string
  const [people, setPeople] = useState<Person[]>(initialPeople.map(p => ({ ...p })))
  const [selectedMethod, setSelectedMethod] = useState<"autocratic" | "consent">("consent")

  const handleRoleChange = (personId: string, role: Person["role"]) => {
    setPeople((prev) =>
      prev.map((person) =>
        person.id === personId ? { ...person, role } : person
      )
    )
  }

  return (
    <>
      <RoleAssignment people={people} onRoleChange={handleRoleChange} />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">Decision making method</CardTitle>
          <CardDescription className="text-sm">
            Given the assigned roles assigned; one of the following methods could be used:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <DecisionMethodCard
              title="Autocratic"
              description="A single decider makes a choice and informs all stakeholders"
              speedValue={90}
              buyInValue={10}
              isSelected={selectedMethod === "autocratic"}
              onSelect={() => setSelectedMethod("autocratic")}
            />
            <DecisionMethodCard
              title="Consent"
              description="The proposal is selected if no one has a strong/reasoned objection"
              speedValue={80}
              buyInValue={90}
              isSelected={selectedMethod === "consent"}
              onSelect={() => setSelectedMethod("consent")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button size="lg" asChild>
          <Link href={`/dashboard/decision/${decisionId}/decide`}>
            Next
          </Link>
        </Button>
      </div>
    </>
  )
}

