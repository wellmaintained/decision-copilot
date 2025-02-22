"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WorkflowProgress } from "@/components/ui/workflow-progress"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { DecisionWorkflowSteps } from "@/lib/domain/Decision"

const projects = [
  { value: "all", label: "All Projects" },
  { value: "mobile-app", label: "Mobile App Redesign" },
  { value: "cloud", label: "Cloud Migration" },
  { value: "portal", label: "Customer Portal" },
  { value: "analytics", label: "Data Analytics Platform" },
] as const

const inProgressDecisions = [
  {
    id: "1",
    title: "Frontend Framework Selection",
    project: "mobile-app",
    driver: {
      name: "David Thompson",
      avatar: "/avatars/david.jpg",
      initials: "DT",
    },
    currentStep: 3,
    lastActivity: "2024-01-14T10:30:00Z",
  },
  {
    id: "2",
    title: "Q1 Marketing Campaign",
    project: "portal",
    driver: {
      name: "Rachel Kim",
      avatar: "/avatars/rachel.jpg",
      initials: "RK",
    },
    currentStep: 2,
    lastActivity: "2024-01-15T08:15:00Z",
  },
  {
    id: "3",
    title: "Product Pricing Strategy",
    project: "analytics",
    driver: {
      name: "Tom Martinez",
      avatar: "/avatars/tom.jpg",
      initials: "TM",
    },
    currentStep: 4,
    lastActivity: "2024-01-15T14:45:00Z",
  },
  {
    id: "4",
    title: "Design System Colors",
    project: "mobile-app",
    driver: {
      name: "Lisa Chen",
      avatar: "/avatars/lisa.jpg",
      initials: "LC",
    },
    currentStep: 1,
    lastActivity: "2024-01-15T16:20:00Z",
  },
  {
    id: "5",
    title: "API Authentication Method",
    project: "cloud",
    driver: {
      name: "Marcus Johnson",
      avatar: "/avatars/marcus.jpg",
      initials: "MJ",
    },
    currentStep: 2,
    lastActivity: "2024-01-15T11:05:00Z",
  },
]

export function InProgressTable() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("all")

  const filteredDecisions = inProgressDecisions.filter(
    (decision) => value === "all" || decision.project.toLowerCase() === value
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>In-Progress Decisions</CardTitle>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {projects.find((project) => project.value === value)?.label ?? "Select project"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search project..." />
              <CommandEmpty>No project found.</CommandEmpty>
              <CommandGroup>
                {projects.map((project) => (
                  <CommandItem
                    key={project.value}
                    value={project.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === project.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {project.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Decision</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDecisions.map((decision) => (
              <TableRow key={decision.id}>
                <TableCell className="font-medium">{decision.title}</TableCell>
                <TableCell>{projects.find(p => p.value === decision.project)?.label}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={decision.driver.avatar} alt={decision.driver.name} />
                      <AvatarFallback>{decision.driver.initials}</AvatarFallback>
                    </Avatar>
                    {decision.driver.name}
                  </div>
                </TableCell>
                <TableCell>
                  <WorkflowProgress currentStep={DecisionWorkflowSteps[decision.currentStep]} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(decision.lastActivity), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

