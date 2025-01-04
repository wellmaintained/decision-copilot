import { Button } from "@/components/ui/button"
import { Pencil, Trash2, FileText } from 'lucide-react'

export default function ProjectDecisionsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button className="bg-blue-500 hover:bg-blue-600">
          🌟 Start new decision
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">In progress</h2>
          <div className="space-y-4">
            {inProgressDecisions.map((decision) => (
              <div
                key={decision.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-white"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{decision.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      decision.tag === 'Frontend' 
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {decision.tag}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {decision.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Published</h2>
          <div className="space-y-4">
            {publishedDecisions.map((decision) => (
              <div
                key={decision.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-white"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{decision.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      decision.tag === 'Frontend' 
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {decision.tag}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {decision.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const inProgressDecisions = [
  {
    id: 1,
    title: "Which backend should be used?",
    description:
      "The app will need to store its data somewhere. Ideally this will be low cost & low maintenance.",
    tag: "Backend"
  },
  {
    id: 2,
    title: "Which database should we use?",
    description:
      "We need to a place to store data for our application. It needs to handle CRUD data manipulation and reporting.",
    tag: "Backend"
  },
  {
    id: 3,
    title: "What kind of coffee machine should we get for the office?",
    description:
      "We need to choose a coffee machine for the office that makes coffee that everyone enjoys.",
    tag: "Frontend"
  },
  {
    id: 4,
    title: "We want to evaluate alternative ORMs for our Java application",
    description:
      "We've been running along fine with ibatis for the last several years. It's starting to reveal some lack of flexibility for new use-cases. Also, only the original 2 folks who wrote the application are familiar with it.",
    tag: "Backend"
  },
  {
    id: 5,
    title: "Which secrets manager should we use",
    description:
      "We've outgrown 1Password and need a new option that is better for machine credentials.",
    tag: "Backend"
  },
]

const publishedDecisions = [
  {
    id: 6,
    title: "Which whiteboarding tool should the team use?",
    description:
      "As a team we're currently using bunch of different whiteboarding tools. Finance wants us to pick one.",
    tag: "Frontend"
  },
  {
    id: 7,
    title: "Which Web Framework should be used to build the Decision Copilot app?",
    description: "We need to choose a Web Framework to build the web app.",
    tag: "Frontend"
  },
]

