import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface Stakeholder {
  name: string
  avatar: string
}

interface DecisionData {
  title: string
  context: string
  decision: string
  method: string
  options: string[]
  criteria: string[]
  stakeholders: {
    decider: Stakeholder
    advisors: Stakeholder[]
    observers: Stakeholder[]
  }
  isPublished: boolean
}

// This would typically come from your database
const sampleDecision: DecisionData = {
  title: "Which backend should be used?",
  context: "The app will need to store its data somewhere. Ideally this will be low cost & low maintenance.",
  decision: "And the final decision is... Firebase!",
  method: "Consent",
  options: ["Firebase", "Python Flask", "Supabase", ".NET"],
  criteria: [
    "It should be easy to host",
    "It should be well supported"
  ],
  stakeholders: {
    decider: {
      name: "David Laing",
      avatar: "/placeholder.svg"
    },
    advisors: [
      { name: "Scott Muc", avatar: "/placeholder.svg" },
      { name: "Ramon Rubio", avatar: "/placeholder.svg" },
      { name: "Wendy Laing", avatar: "/placeholder.svg" },
      { name: "Odélia Porto", avatar: "/placeholder.svg" }
    ],
    observers: [
      { name: "Ana Leclerc", avatar: "/placeholder.svg" },
      { name: "Nalan Erçetin", avatar: "/placeholder.svg" }
    ]
  },
  isPublished: true
}

function StakeholderGroup({ title, stakeholders }: { title: string, stakeholders: Stakeholder[] }) {
  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">{title}</h3>
      <div className="space-y-3">
        {stakeholders.map((stakeholder) => (
          <div key={stakeholder.name} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={stakeholder.avatar} alt={stakeholder.name} />
              <AvatarFallback>{stakeholder.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-slate-600">{stakeholder.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DecisionView() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">{sampleDecision.title}</h1>
        <p className="text-slate-600">{sampleDecision.context}</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-800">Decision</h2>
        <p className="text-slate-600">{sampleDecision.decision}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-800">Method</h2>
        <p className="text-slate-600">{sampleDecision.method}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Options considered</h2>
        <ol className="list-decimal list-inside space-y-2">
          {sampleDecision.options.map((option) => (
            <li key={option} className="text-slate-600">{option}</li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Criteria</h2>
        <ol className="list-decimal list-inside space-y-2">
          {sampleDecision.criteria.map((criterion) => (
            <li key={criterion} className="text-slate-600">{criterion}</li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Stakeholders</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <StakeholderGroup 
            title="Decider" 
            stakeholders={[sampleDecision.stakeholders.decider]} 
          />
          <StakeholderGroup 
            title="Advisors" 
            stakeholders={sampleDecision.stakeholders.advisors} 
          />
          <StakeholderGroup 
            title="Observers" 
            stakeholders={sampleDecision.stakeholders.observers} 
          />
        </div>
      </section>

      {sampleDecision.isPublished && (
        <div className="bottom-0 right-0 bg-sky-100 p-4 flex items-center justify-between z-50">
          <p className="text-slate-700">This decision has been published and can no longer be edited</p>
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/decision/identify">
            Un-publish
          </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

