"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  AreaChart as RechartsAreaChart,
} from "recharts"

const ChartContainer = React.forwardRef(({ className, config, children, ...props }, ref) => {
  // Apply CSS variables for colors
  React.useEffect(() => {
    if (config) {
      const root = document.documentElement
      Object.entries(config).forEach(([key, { color }]) => {
        root.style.setProperty(`--color-${key}`, color)
      })
    }

    return () => {
      if (config) {
        const root = document.documentElement
        Object.entries(config).forEach(([key]) => {
          root.style.removeProperty(`--color-${key}`)
        })
      }
    }
  }, [config])

  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      {children}
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("bg-gray-800 border border-gray-700 p-2 rounded shadow-md", className)} {...props} />
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-md">
      <p className="text-gray-300 text-xs font-medium">{label}</p>
      <div className="mt-1">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center text-xs">
            <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-300">{entry.name}: </span>
            <span className="text-white ml-1 font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Export the components
export {
  RechartsBarChart as BarChart,
  RechartsLineChart as LineChart,
  RechartsPieChart as PieChart,
  RechartsAreaChart as AreaChart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
}
