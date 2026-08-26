import { useQuery } from "@tanstack/react-query"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"
import { useIsMobile } from "~/hooks/use-mobile"
import { useAuraEvent } from "~/lib/aura"
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
  const toggleRef = React.useRef<HTMLElement>(null)
  const selectRef = React.useRef<HTMLElement>(null)
  useAuraEvent<string>(toggleRef, "change", (v) => v && setTimeRange(v))
  useAuraEvent<string>(selectRef, "change", setTimeRange)

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
    <a-card>
      <div className="flex flex-col gap-1.5 p-6">
        <a-head level="3" className="font-semibold">
          Project Verifications
        </a-head>
        <p className="text-muted-foreground text-sm">
          Last{" "}
          {timeRange === "90d"
            ? "3 months"
            : timeRange === "30d"
              ? "30 days"
              : "7 days"}
        </p>
        <div className="flex justify-end">
          <a-toggle-group
            ref={toggleRef}
            type="single"
            value={timeRange}
            className="hidden @[767px]:flex"
          >
            <a-toggle variant="outline" value="90d">
              3 months
            </a-toggle>
            <a-toggle variant="outline" value="30d">
              30 days
            </a-toggle>
            <a-toggle variant="outline" value="7d">
              7 days
            </a-toggle>
          </a-toggle-group>
          <a-select
            ref={selectRef}
            value={timeRange}
            className="w-40 @[767px]:hidden"
            options={[
              { value: "90d", label: "Last 3 months" },
              { value: "30d", label: "Last 30 days" },
              { value: "7d", label: "Last 7 days" },
            ]}
          />
        </div>
      </div>
      <div className="p-6 pt-0">
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
      </div>
    </a-card>
  )
}
