"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Person {
  id: string
  name: string
  image: string
  role: "decider" | "advisor" | "observer"
}

interface RoleAssignmentProps {
  people: Person[]
  onRoleChange: (personId: string, role: Person["role"]) => void
}

export function RoleAssignment({ people, onRoleChange }: RoleAssignmentProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Assign roles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          {people.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between border-b p-5 last:border-0"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={person.image} alt={person.name} />
                  <AvatarFallback>{person.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{person.name}</span>
              </div>
              <RadioGroup
                defaultValue={person.role}
                onValueChange={(value) => onRoleChange(person.id, value as Person["role"])}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2.5">
                  <RadioGroupItem value="decider" id={`${person.id}-decider`} className="h-5 w-5" />
                  <Label htmlFor={`${person.id}-decider`} className="text-sm">Decider</Label>
                </div>
                <div className="flex items-center space-x-2.5">
                  <RadioGroupItem value="advisor" id={`${person.id}-advisor`} className="h-5 w-5" />
                  <Label htmlFor={`${person.id}-advisor`} className="text-sm">Advisor</Label>
                </div>
                <div className="flex items-center space-x-2.5">
                  <RadioGroupItem value="observer" id={`${person.id}-observer`} className="h-5 w-5" />
                  <Label htmlFor={`${person.id}-observer`} className="text-sm">Observer</Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

