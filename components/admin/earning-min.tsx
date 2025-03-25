//@ts-nocheck


"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchEarnings } from "@/redux/slices/earning"
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts"
import { DollarSign, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

export default function AdminEarningsMiniOverview() {
  const [isLoading, setIsLoading] = useState(true)
  const [revenueData, setRevenueData] = useState([])
  const [stats, setStats] = useState({
    totalRevenue: { value: 0, change: 0, trend: "neutral" },
    netProfit: { value: 0, change: 0, trend: "neutral" },
    paidPercentage: 0,
    pendingPercentage: 0,
  })

  const dispatch = useAppDispatch()
  const router = useRouter()
  const { earnings, loading } = useAppSelector((state) => state.earnings)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await dispatch(fetchEarnings())
      setIsLoading(false)
    }

    fetchData()
  }, [dispatch])

  useEffect(() => {
    if (earnings.length > 0) {
      processEarningsData()
    }
  }, [earnings])

  const processEarningsData = () => {
    // Get current month earnings
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const currentMonthEarnings = earnings.filter((earning) => {
      const earningDate = new Date(earning.createdAt)
      return earningDate >= startOfMonth && earningDate <= now
    })

    // Calculate total revenue for current month
    const totalRevenue = currentMonthEarnings.reduce((sum, earning) => sum + earning.amount, 0)

    // Calculate previous month for comparison
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const previousMonthEarnings = earnings.filter((earning) => {
      const earningDate = new Date(earning.createdAt)
      return earningDate >= previousMonthStart && earningDate <= previousMonthEnd
    })

    const previousMonthRevenue = previousMonthEarnings.reduce((sum, earning) => sum + earning.amount, 0)

    // Calculate change percentage
    const revenueChange =
      previousMonthRevenue === 0 ? 100 : ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100

    // Simulate expenses (in a real app, this would come from actual expense data)
    // For this example, we'll assume expenses are 40% of revenue
    const expenses = totalRevenue * 0.4
    const netProfit = totalRevenue - expenses

    const previousMonthExpenses = previousMonthRevenue * 0.4
    const previousMonthNetProfit = previousMonthRevenue - previousMonthExpenses

    const netProfitChange =
      previousMonthNetProfit === 0 ? 100 : ((netProfit - previousMonthNetProfit) / previousMonthNetProfit) * 100

    // Calculate paid vs pending percentages
    const paidEarnings = currentMonthEarnings
      .filter((earning) => earning.isPaid)
      .reduce((sum, earning) => sum + earning.amount, 0)

    const paidPercentage = totalRevenue > 0 ? (paidEarnings / totalRevenue) * 100 : 0
    const pendingPercentage = 100 - paidPercentage

    // Update stats
    setStats({
      totalRevenue: {
        value: totalRevenue,
        change: revenueChange,
        trend: revenueChange >= 0 ? "up" : "down",
      },
      netProfit: {
        value: netProfit,
        change: netProfitChange,
        trend: netProfitChange >= 0 ? "up" : "down",
      },
      paidPercentage,
      pendingPercentage,
    })

    // Generate sparkline data
    generateSparklineData()
  }

  const generateSparklineData = () => {
    // Get last 30 days of data
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const dateMap = new Map()

    // Initialize all dates with zero values
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo)
      date.setDate(thirtyDaysAgo.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]

      dateMap.set(dateStr, {
        date: dateStr,
        revenue: 0,
      })
    }

    // Aggregate earnings by date
    earnings.forEach((earning) => {
      const earningDate = new Date(earning.createdAt)
      if (earningDate >= thirtyDaysAgo && earningDate <= now) {
        const dateStr = earningDate.toISOString().split("T")[0]

        if (dateMap.has(dateStr)) {
          const entry = dateMap.get(dateStr)
          entry.revenue += earning.amount
        }
      }
    })

    // Convert map to array and sort by date
    const sparklineData = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    setRevenueData(sparklineData)
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Custom tooltip for sparkline
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded-md shadow-sm text-xs">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-indigo-500/10 to-indigo-700/10">
        <CardTitle className="text-sm font-medium">Earnings Overview</CardTitle>
        <DollarSign className="h-4 w-4 text-indigo-500" />
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-[60px] w-full" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue.value)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span
                    className={`flex items-center ${stats.totalRevenue.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {stats.totalRevenue.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(stats.totalRevenue.change).toFixed(1)}%
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Net Profit</div>
                <div className="text-lg font-semibold">{formatCurrency(stats.netProfit.value)}</div>
              </div>
            </div>

            <div className="h-[60px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex justify-between items-center mb-1">
                <span>Payment Status</span>
                <span>{stats.paidPercentage.toFixed(0)}% paid</span>
              </div>
              <div className="flex w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${stats.paidPercentage}%` }} />
                <div className="bg-amber-500 h-full" style={{ width: `${stats.pendingPercentage}%` }} />
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="p-2 bg-muted/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs justify-between"
          onClick={() => router.push("/control-panel-x7z9q/earnings")}
        >
          <span>View detailed analytics</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}

