import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Decision, StakeholderRole } from "@/lib/domain/Decision"
import { Stakeholder } from "@/lib/domain/Stakeholder"

interface StakeholderRoleGroupsProps {
  decision: Decision
  stakeholders: Stakeholder[]
}

function StakeholderPill({ stakeholder }: { stakeholder: Stakeholder }) {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
      <Avatar className="h-6 w-6">
        <AvatarImage src={stakeholder.photoURL || ''} />
        <AvatarFallback>{stakeholder.displayName?.charAt(0) || '?'}</AvatarFallback>
      </Avatar>
      <span className="text-sm">{stakeholder.displayName}</span>
    </div>
  )
}

function StakeholderGroup({ 
  title, 
  stakeholders
}: { 
  title: string, 
  stakeholders: { stakeholder: Stakeholder, role: StakeholderRole }[]
}) {
  if (stakeholders.length === 0) return null;

  return (
    <div className="flex-1 space-y-4">
      <h3 className="text-lg font-semibold text-slate-700">
        {title}
      </h3>
      <div className="space-y-2">
        {stakeholders.map(({ stakeholder }) => (
          <StakeholderPill 
            key={stakeholder.id} 
            stakeholder={stakeholder}
          />
        ))}
      </div>
    </div>
  )
}

export function StakeholderRoleGroups({ decision, stakeholders }: StakeholderRoleGroupsProps) {
  const stakeholdersByRole = decision.stakeholders.reduce((acc, { stakeholder_id, role }) => {
    const stakeholder = stakeholders.find(s => s.id === stakeholder_id);
    if (stakeholder) {
      acc[role] = [...(acc[role] || []), { stakeholder, role }];
    }
    return acc;
  }, {} as Record<StakeholderRole, { stakeholder: Stakeholder, role: StakeholderRole }[]>);

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <StakeholderGroup 
        title="Deciders" 
        stakeholders={stakeholdersByRole.decider || []}
      />
      <StakeholderGroup 
        title="Consulted" 
        stakeholders={stakeholdersByRole.consulted || []}
      />
      <StakeholderGroup 
        title="Informed" 
        stakeholders={stakeholdersByRole.informed || []}
      />
    </div>
  )
} 