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
  // Split project name into words
  const words = payload.value.split(' ')
  
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
        {words.map((word, i) => (
          <tspan key={i} x={0} dy={i === 0 ? "10" : "15"}>
            {word}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const data = [
  {
    project: "Mobile App Redesign",
    inProgress: 4,
    decided: 8,
  },
  {
    project: "Cloud Migration",
    inProgress: 3,
    decided: 10,
  },
  {
    project: "Customer Portal",
    inProgress: 5,
    decided: 7,
  },
  {
    project: "Data Analytics Platform",
    inProgress: 2,
    decided: 5,
  },
]

export function ProjectDecisionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Decisions by Project</CardTitle>
        <CardDescription>
          Number of in-progress and decided decisions per project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer
              config={{
                decided: {
                  label: "Decided",
                  color: "hsl(var(--muted-foreground))",
                },
                inProgress: {
                  label: "In Progress",
                  color: "hsl(var(--success))",
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
                  dataKey="project"
                  angle={-60}
                  height={80}
                  interval={0}
                  tick={<CustomTick angle={-60} />}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="decided" 
                  fill="hsl(var(--muted-foreground))"
                  stackId="stack"
                />
                <Bar 
                  dataKey="inProgress" 
                  fill="hsl(var(--success))"
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

