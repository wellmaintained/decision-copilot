import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricSlider } from "./metric-slider"

interface DecisionMethodCardProps {
  title: string
  description: string
  speedValue: number
  buyInValue: number
  isSelected?: boolean
  onSelect: () => void
}

export function DecisionMethodCard({
  title,
  description,
  speedValue,
  buyInValue,
  isSelected,
  onSelect,
}: DecisionMethodCardProps) {
  return (
    <Card className={cn("flex flex-col", isSelected && "border-primary")}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-8">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="space-y-6">
          <MetricSlider
            label="Speed"
            defaultValue={[speedValue]}
            max={100}
            step={1}
            disabled
          />
          <MetricSlider
            label="Buy-in"
            defaultValue={[buyInValue]}
            max={100}
            step={1}
            disabled
          />
        </div>
        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          onClick={onSelect}
        >
          Select
        </Button>
      </CardContent>
    </Card>
  )
}

