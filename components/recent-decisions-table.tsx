import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const recentDecisions = [
  {
    id: "1",
    title: "Frontend Framework Selection",
    team: "Engineering",
    decider: {
      name: "Sarah Chen",
      avatar: "/avatars/sarah.jpg",
      initials: "SC",
    },
    status: "In Progress",
    lastActivity: "2h ago",
  },
  {
    id: "2",
    title: "Q1 Marketing Strategy",
    team: "Marketing",
    decider: {
      name: "Michael Park",
      avatar: "/avatars/michael.jpg",
      initials: "MP",
    },
    status: "Decided",
    lastActivity: "5h ago",
  },
  {
    id: "3",
    title: "New Product Pricing",
    team: "Product",
    decider: {
      name: "Emma Wilson",
      avatar: "/avatars/emma.jpg",
      initials: "EW",
    },
    status: "In Progress",
    lastActivity: "1d ago",
  },
  {
    id: "4",
    title: "Design System Update",
    team: "Design",
    decider: {
      name: "James Lee",
      avatar: "/avatars/james.jpg",
      initials: "JL",
    },
    status: "Decided",
    lastActivity: "1d ago",
  },
  {
    id: "5",
    title: "API Architecture",
    team: "Engineering",
    decider: {
      name: "Alex Kumar",
      avatar: "/avatars/alex.jpg",
      initials: "AK",
    },
    status: "In Progress",
    lastActivity: "2d ago",
  },
]

export function RecentDecisionsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Decision</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Decider</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentDecisions.map((decision) => (
          <TableRow key={decision.id}>
            <TableCell className="font-medium">{decision.title}</TableCell>
            <TableCell>{decision.team}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={decision.decider.avatar} alt={decision.decider.name} />
                  <AvatarFallback>{decision.decider.initials}</AvatarFallback>
                </Avatar>
                {decision.decider.name}
              </div>
            </TableCell>
            <TableCell>
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  decision.status === "In Progress"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                }`}
              >
                {decision.status}
              </div>
            </TableCell>
            <TableCell>{decision.lastActivity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

