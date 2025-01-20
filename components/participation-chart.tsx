"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface CustomTickProps {
  x: number
  y: number
  payload: {
    value: string
  }
  angle: number
}

const CustomTick = ({ x, y, payload, angle }: CustomTickProps) => {
  // Split name into first and last name
  const [firstName, lastName] = payload.value.split(' ');
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dx={-5}
        textAnchor="end"
        transform={`rotate(${angle})`}
        style={{ fontSize: '12px' }}
      >
        <tspan x={0} dy="10">{firstName}</tspan>
        <tspan x={0} dy="15">{lastName}</tspan>
      </text>
    </g>
  );
};

const data = [
  {
    name: "Sarah Chen",
    decider: 8,
    advisor: 15,
    observer: 4,
  },
  {
    name: "Michael Park",
    decider: 6,
    advisor: 12,
    observer: 8,
  },
  {
    name: "Emma Wilson",
    decider: 4,
    advisor: 10,
    observer: 12,
  },
  {
    name: "James Lee",
    decider: 7,
    advisor: 8,
    observer: 6,
  },
  {
    name: "Alex Kumar",
    decider: 5,
    advisor: 14,
    observer: 7,
  },
]

export function ParticipationChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Member Participation</CardTitle>
        <CardDescription>
          Decision roles per team member
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer
              config={{
                decider: {
                  label: "Decider",
                  color: "hsl(var(--chart-1))",
                },
                advisor: {
                  label: "Advisor",
                  color: "hsl(var(--chart-2))",
                },
                observer: {
                  label: "Observer",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-60}
                  height={80}
                  interval={0}
                  tick={(props) => <CustomTick {...props} angle={-60} />}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="decider" 
                  fill="var(--color-decider)" 
                  stackId="stack"
                />
                <Bar 
                  dataKey="advisor" 
                  fill="var(--color-advisor)" 
                  stackId="stack"
                />
                <Bar 
                  dataKey="observer" 
                  fill="var(--color-observer)" 
                  stackId="stack"
                />
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

