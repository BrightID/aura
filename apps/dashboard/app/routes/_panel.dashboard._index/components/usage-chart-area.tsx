import { useQuery } from "@tanstack/react-query"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { useIsMobile } from "~/hooks/use-mobile"
import * as React from "react"

const chartConfig = {
  verifications: { label: "Verifications", color: "hsl(var(--primary))" },
} satisfies import("~/components/ui/chart").ChartConfig

async function fetchUsage(projectId: string) {
  const res = await fetch(
    `${import.meta.env["VITE_SOME_AURA_DASHBOARD_API_URL"]}/api/projects/${projectId}/usage`,
    {
      headers: {
        authorization: `Bearer ${await (await import("firebase/auth")).getAuth().currentUser?.getIdToken()}`,
      },
    }
  )
  if (!res.ok) throw new Error("Failed")
  const json = await res.json()
  return json.data as { date: string; verifications: number }[]
}

export function ProjectUsageChart({ projectId }: { projectId: string }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  const { data: chartData = [] } = useQuery({
    queryKey: ["project-usage", projectId],
    queryFn: () => fetchUsage(projectId),
  })

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const days = timeRange === "90d" ? 90 : timeRange === "30d" ? 30 : 7
    return date >= new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  })

  React.useEffect(() => {
    isMobile && setTimeRange("7d")
  }, [isMobile])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Verifications</CardTitle>
        <CardDescription>
          Last{" "}
          {timeRange === "90d"
            ? "3 months"
            : timeRange === "30d"
              ? "30 days"
              : "7 days"}
        </CardDescription>
        <div className="flex justify-end">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            className="hidden @[767px]:flex"
            variant={"outline"}
          >
            <ToggleGroupItem value="90d">3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 @[767px]:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillVerif" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-verifications)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-verifications)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="verifications"
              type="natural"
              fill="url(#fillVerif)"
              stroke="var(--color-verifications)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
