import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useTeamHierarchy } from "@/hooks/useTeamHierarchy";
import { useStakeholderTeams } from "@/hooks/useStakeholderTeams";
import { motion, AnimatePresence } from "framer-motion";

interface StakeholderListViewProps {
  organisationId: string;
  selectedStakeholderIds: string[];
  onStakeholderChange: (stakeholderId: string | string[], selected: boolean) => void;
  driverStakeholderId?: string;
}

export function StakeholderListView({
  organisationId,
  selectedStakeholderIds,
  onStakeholderChange,
  driverStakeholderId,
}: StakeholderListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { stakeholders, loading: stakeholdersLoading } = useStakeholders();
  const { hierarchy, loading: hierarchyLoading } = useTeamHierarchy(organisationId);
  const { stakeholderTeams, loading: teamsLoading } = useStakeholderTeams();

  const loading = stakeholdersLoading || hierarchyLoading || teamsLoading;

  // Filter and sort stakeholders
  const filteredAndSortedStakeholders = stakeholders
    .filter((stakeholder) =>
      stakeholder.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // First sort by checked status
      const aChecked = selectedStakeholderIds.includes(a.id);
      const bChecked = selectedStakeholderIds.includes(b.id);
      if (aChecked !== bChecked) {
        return aChecked ? -1 : 1;
      }
      // Then sort by display name
      return a.displayName.localeCompare(b.displayName);
    });

  // Get team names for a stakeholder
  const getTeamNamesForStakeholder = (stakeholderId: string): string => {
    if (!hierarchy) return "";
    
    const teamIds = stakeholderTeams
      .filter((st) => st.stakeholderId === stakeholderId)
      .map((st) => st.teamId);
    
    return teamIds
      .map((teamId) => hierarchy.teams[teamId]?.name || "Unknown Team")
      .join(", ");
  };

  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search stakeholders..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <motion.div
        className="space-y-2"
        layout
      >
        <AnimatePresence>
          {filteredAndSortedStakeholders.map((stakeholder) => (
            <motion.div
              key={stakeholder.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  id={`stakeholder-${stakeholder.id}`}
                  checked={selectedStakeholderIds.includes(stakeholder.id)}
                  onCheckedChange={(checked) =>
                    onStakeholderChange(stakeholder.id, checked as boolean)
                  }
                  disabled={driverStakeholderId === stakeholder.id}
                  className={driverStakeholderId === stakeholder.id ?
                    "cursor-not-allowed border-gray-500 data-[state=checked]:bg-gray-500" : ""}
                />
                <Avatar>
                  <AvatarImage src={stakeholder.photoURL} alt={stakeholder.displayName} />
                  <AvatarFallback>
                    {stakeholder.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="font-medium">{stakeholder.displayName}</div>
                  {driverStakeholderId === stakeholder.id && (
                    <span className="text-xs text-gray-500 font-medium">Driver</span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {getTeamNamesForStakeholder(stakeholder.id) || "No teams"}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredAndSortedStakeholders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            No stakeholders found
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 