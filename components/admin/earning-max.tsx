//@ts-nocheck

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchEarnings } from "@/redux/slices/earning"
import { fetchRequests } from "@/redux/slices/requests"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  Scatter,
} from "recharts"
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  FileText,
  Users,
  CreditCard,
  Wallet,
  PieChartIcon,
  BarChart3,
  LineChartIcon,
  Percent,
  Target,
  Landmark,
  CircleDollarSign,
  Receipt,
  BadgeDollarSign,
  Coins,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
// import { DatePickerWithRange } from "date-range-picker"
import { format, subDays, subMonths, startOfYear } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

// Define types for our financial data
interface FinancialMetric {
  value: number
  change: number
  trend: "up" | "down" | "neutral"
}

interface FinancialData {
  totalRevenue: FinancialMetric
  netProfit: FinancialMetric
  expenses: FinancialMetric
  avgEarningPerRequest: FinancialMetric
  totalPaid: FinancialMetric
  totalPending: FinancialMetric
  revenueBySource: {
    recovery: number
    protection: number
    other: number
  }
  expensesByCategory: {
    operational: number
    marketing: number
    salaries: number
    infrastructure: number
    other: number
  }
  kpis: {
    cac: FinancialMetric
    cltv: FinancialMetric
    roi: FinancialMetric
    profitMargin: FinancialMetric
  }
}

export default function AdminEarningsOverview() {
  const [timeFilter, setTimeFilter] = useState("month")
  const [chartType, setChartType] = useState("area")
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 1),
    to: new Date(),
  })
  const [revenueData, setRevenueData] = useState([])
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalRevenue: { value: 0, change: 0, trend: "neutral" },
    netProfit: { value: 0, change: 0, trend: "neutral" },
    expenses: { value: 0, change: 0, trend: "neutral" },
    avgEarningPerRequest: { value: 0, change: 0, trend: "neutral" },
    totalPaid: { value: 0, change: 0, trend: "neutral" },
    totalPending: { value: 0, change: 0, trend: "neutral" },
    revenueBySource: {
      recovery: 0,
      protection: 0,
      other: 0,
    },
    expensesByCategory: {
      operational: 0,
      marketing: 0,
      salaries: 0,
      infrastructure: 0,
      other: 0,
    },
    kpis: {
      cac: { value: 0, change: 0, trend: "neutral" },
      cltv: { value: 0, change: 0, trend: "neutral" },
      roi: { value: 0, change: 0, trend: "neutral" },
      profitMargin: { value: 0, change: 0, trend: "neutral" },
    },
  })
  const [topEarners, setTopEarners] = useState([])
  const [selectedSources, setSelectedSources] = useState({
    recovery: true,
    protection: true,
    other: true,
  })

  const dispatch = useAppDispatch()
  const { earnings, loading } = useAppSelector((state) => state.earnings)
  const { requests } = useAppSelector((state) => state.requests)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([dispatch(fetchEarnings()), dispatch(fetchRequests())])
      setIsLoading(false)
    }

    fetchData()
  }, [dispatch])

  // Set date range based on time filter
  useEffect(() => {
    const now = new Date()
    let from = new Date()

    switch (timeFilter) {
      case "week":
        from = subDays(now, 7)
        break
      case "month":
        from = subMonths(now, 1)
        break
      case "quarter":
        from = subMonths(now, 3)
        break
      case "year":
        from = subMonths(now, 12)
        break
      case "ytd":
        from = startOfYear(now)
        break
      case "custom":
        // Keep existing custom range
        return
      default:
        from = subDays(now, 30) // Default to 30 days
    }

    setDateRange({ from, to: now })
  }, [timeFilter])

  // Process earnings data when it changes or date range changes
  useEffect(() => {
    if (earnings.length > 0 && requests.length > 0) {
      processEarningsData()
    }
  }, [earnings, requests, dateRange, selectedSources])

  const processEarningsData = () => {
    // Filter earnings by date range
    const filteredEarnings = earnings.filter((earning) => {
      const earningDate = new Date(earning.createdAt)
      return earningDate >= dateRange.from && earningDate <= dateRange.to
    })

    // Calculate total revenue for current period
    const totalRevenue = filteredEarnings.reduce((sum, earning) => sum + earning.amount, 0)

    // Calculate revenue by source
    const recoveryEarnings = filteredEarnings
      .filter((earning) => earning.request?.requestType === "recovery")
      .reduce((sum, earning) => sum + earning.amount, 0)

    const protectionEarnings = filteredEarnings
      .filter((earning) => earning.request?.requestType === "protection")
      .reduce((sum, earning) => sum + earning.amount, 0)

    const otherEarnings = totalRevenue - recoveryEarnings - protectionEarnings

    // Calculate paid vs pending
    const paidEarnings = filteredEarnings
      .filter((earning) => earning.isPaid)
      .reduce((sum, earning) => sum + earning.amount, 0)
    const pendingEarnings = totalRevenue - paidEarnings

    // Calculate previous period for comparison
    const previousPeriodStart = new Date(dateRange.from)
    const previousPeriodEnd = new Date(dateRange.from)
    const currentPeriodDuration = dateRange.to.getTime() - dateRange.from.getTime()
    previousPeriodStart.setTime(previousPeriodStart.getTime() - currentPeriodDuration)
    previousPeriodEnd.setTime(previousPeriodEnd.getTime() - 1) // 1ms before current period

    const previousPeriodEarnings = earnings.filter((earning) => {
      const earningDate = new Date(earning.createdAt)
      return earningDate >= previousPeriodStart && earningDate <= previousPeriodEnd
    })

    const previousPeriodRevenue = previousPeriodEarnings.reduce((sum, earning) => sum + earning.amount, 0)

    // Calculate change percentage
    const revenueChange =
      previousPeriodRevenue === 0 ? 100 : ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100

    // Simulate expenses (in a real app, this would come from actual expense data)
    // For this example, we'll assume expenses are 40% of revenue
    const expenses = totalRevenue * 0.4
    const previousPeriodExpenses = previousPeriodRevenue * 0.4
    const expensesChange =
      previousPeriodExpenses === 0 ? 0 : ((expenses - previousPeriodExpenses) / previousPeriodExpenses) * 100

    // Calculate net profit
    const netProfit = totalRevenue - expenses
    const previousPeriodNetProfit = previousPeriodRevenue - previousPeriodExpenses
    const netProfitChange =
      previousPeriodNetProfit === 0 ? 100 : ((netProfit - previousPeriodNetProfit) / previousPeriodNetProfit) * 100

    // Calculate average earning per request
    const requestsInPeriod = requests.filter((request) => {
      const requestDate = new Date(request.createdAt)
      return requestDate >= dateRange.from && requestDate <= dateRange.to
    }).length

    const avgEarningPerRequest = requestsInPeriod === 0 ? 0 : totalRevenue / requestsInPeriod

    // Simulate expense breakdown
    const expensesByCategory = {
      operational: expenses * 0.3,
      marketing: expenses * 0.25,
      salaries: expenses * 0.35,
      infrastructure: expenses * 0.05,
      other: expenses * 0.05,
    }

    // Simulate KPIs
    // In a real app, these would be calculated from actual data
    const kpis = {
      cac: {
        value: 25,
        change: 5,
        trend: "down" as const,
      },
      cltv: {
        value: 120,
        change: 10,
        trend: "up" as const,
      },
      roi: {
        value: (netProfit / expenses) * 100,
        change: 8,
        trend: "up" as const,
      },
      profitMargin: {
        value: (netProfit / totalRevenue) * 100,
        change: 2,
        trend: "up" as const,
      },
    }

    // Update financial data
    setFinancialData({
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
      expenses: {
        value: expenses,
        change: expensesChange,
        trend: expensesChange <= 0 ? "up" : "down", // Lower expenses is good
      },
      avgEarningPerRequest: {
        value: avgEarningPerRequest,
        change: 5, // Simulated change
        trend: "up",
      },
      totalPaid: {
        value: paidEarnings,
        change: 0,
        trend: "neutral",
      },
      totalPending: {
        value: pendingEarnings,
        change: 0,
        trend: "neutral",
      },
      revenueBySource: {
        recovery: recoveryEarnings,
        protection: protectionEarnings,
        other: otherEarnings,
      },
      expensesByCategory,
      kpis,
    })

    // Generate time series data for charts
    generateTimeSeriesData(filteredEarnings)

    // Calculate top earners
    calculateTopEarners(filteredEarnings)
  }

  const generateTimeSeriesData = (filteredEarnings) => {
    const timeData = []
    const dateMap = new Map()

    // Determine the appropriate interval based on the date range
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    let interval = "day"

    if (daysDiff > 90) {
      interval = "month"
    } else if (daysDiff > 30) {
      interval = "week"
    }

    // Generate date points
    const currentDate = new Date(dateRange.from)
    while (currentDate <= dateRange.to) {
      let key

      if (interval === "day") {
        key = format(currentDate, "yyyy-MM-dd")
      } else if (interval === "week") {
        // Use the start of the week as the key
        key = format(currentDate, "yyyy-MM-dd") + "_week"
      } else {
        key = format(currentDate, "yyyy-MM")
      }

      if (!dateMap.has(key)) {
        dateMap.set(key, {
          date: new Date(currentDate),
          revenue: 0,
          expenses: 0,
          profit: 0,
          recovery: 0,
          protection: 0,
          other: 0,
        })
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Aggregate earnings by date
    filteredEarnings.forEach((earning) => {
      const earningDate = new Date(earning.createdAt)
      let key

      if (interval === "day") {
        key = format(earningDate, "yyyy-MM-dd")
      } else if (interval === "week") {
        key = format(earningDate, "yyyy-MM-dd") + "_week"
      } else {
        key = format(earningDate, "yyyy-MM")
      }

      if (dateMap.has(key)) {
        const entry = dateMap.get(key)
        entry.revenue += earning.amount

        // Categorize by request type
        if (earning.request?.requestType === "recovery") {
          entry.recovery += earning.amount
        } else if (earning.request?.requestType === "protection") {
          entry.protection += earning.amount
        } else {
          entry.other += earning.amount
        }

        // Simulate expenses (40% of revenue)
        entry.expenses = entry.revenue * 0.4
        entry.profit = entry.revenue - entry.expenses
      }
    })

    // Convert map to array and sort by date
    dateMap.forEach((value, key) => {
      let label

      if (interval === "day") {
        label = format(value.date, "d MMM")
      } else if (interval === "week") {
        label = `Week of ${format(value.date, "d MMM")}`
      } else {
        label = format(value.date, "MMM yyyy")
      }

      timeData.push({
        name: label,
        revenue: value.revenue,
        expenses: value.expenses,
        profit: value.profit,
        recovery: value.recovery,
        protection: value.protection,
        other: value.other,
      })
    })

    // Sort by date
    timeData.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    setRevenueData(timeData)
  }

  const calculateTopEarners = (filteredEarnings) => {
    // Group earnings by handler
    const handlerMap = new Map()

    filteredEarnings.forEach((earning) => {
      if (earning.handler) {
        const handlerId = earning.handler._id

        if (!handlerMap.has(handlerId)) {
          handlerMap.set(handlerId, {
            handler: earning.handler,
            totalEarnings: 0,
            requestCount: 0,
            paidEarnings: 0,
            pendingEarnings: 0,
          })
        }

        const handlerData = handlerMap.get(handlerId)
        handlerData.totalEarnings += earning.amount
        handlerData.requestCount += 1

        if (earning.isPaid) {
          handlerData.paidEarnings += earning.amount
        } else {
          handlerData.pendingEarnings += earning.amount
        }
      }
    })

    // Convert to array and sort by total earnings
    const sortedEarners = Array.from(handlerMap.values())
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 5)
      .map((earner, index) => ({
        ...earner,
        rank: index + 1,
        avgEarningPerRequest: earner.requestCount > 0 ? earner.totalEarnings / earner.requestCount : 0,
      }))

    setTopEarners(sortedEarners)
  }

  // Get user initials for avatar fallback
  const getUserInitials = (username) => {
    if (!username) return ""
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Filter payload based on selected sources
      const filteredPayload = payload.filter((entry) => {
        if (entry.dataKey === "revenue" || entry.dataKey === "expenses" || entry.dataKey === "profit") {
          return true
        }
        return selectedSources[entry.dataKey]
      })

      if (filteredPayload.length === 0) return null

      return (
        <div className="bg-background p-4 border rounded-md shadow-md">
          <p className="font-medium text-sm mb-2">{label}</p>
          {filteredPayload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span>
                {entry.name}: <span className="font-semibold">${entry.value.toFixed(2)}</span>
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Colors for charts
  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
  const CHART_COLORS = {
    revenue: "#6366f1",
    expenses: "#ef4444",
    profit: "#10b981",
    recovery: "#f59e0b",
    protection: "#8b5cf6",
    other: "#94a3b8",
  }

  // Handle source selection change
  const handleSourceChange = (source) => {
    setSelectedSources((prev) => ({
      ...prev,
      [source]: !prev[source],
    }))
  }

  // Render the appropriate chart based on the selected type
  const renderChart = () => {
    switch (chartType) {
      case "area":
        return (
          <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.8} />
                <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.expenses} stopOpacity={0.8} />
                <stop offset="95%" stopColor={CHART_COLORS.expenses} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.profit} stopOpacity={0.8} />
                <stop offset="95%" stopColor={CHART_COLORS.profit} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis allowDecimals={false} stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={CHART_COLORS.revenue}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke={CHART_COLORS.expenses}
              fillOpacity={1}
              fill="url(#colorExpenses)"
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="Net Profit"
              stroke={CHART_COLORS.profit}
              fillOpacity={1}
              fill="url(#colorProfit)"
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        )
      case "line":
        return (
          <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis allowDecimals={false} stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={CHART_COLORS.revenue}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke={CHART_COLORS.expenses}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Net Profit"
              stroke={CHART_COLORS.profit}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )
      case "bar":
        return (
          <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis allowDecimals={false} stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.revenue} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill={CHART_COLORS.expenses} radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" name="Net Profit" fill={CHART_COLORS.profit} radius={[4, 4, 0, 0]} />
          </BarChart>
        )
      case "composed":
        return (
          <ComposedChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis allowDecimals={false} stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.revenue} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill={CHART_COLORS.expenses} radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="profit"
              name="Net Profit"
              stroke={CHART_COLORS.profit}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </ComposedChart>
        )
      case "source":
        return (
          <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.recovery} stopOpacity={0.8} />
                <stop offset="95%" stopColor={CHART_COLORS.recovery} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProtection" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.protection} stopOpacity={0.8} />
                <stop offset="95%" stopColor={CHART_COLORS.protection} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOther" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.other} stopOpacity={0.8} />
                <stop offset="95%" stopColor={CHART_COLORS.other} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis allowDecimals={false} stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedSources.recovery && (
              <Area
                type="monotone"
                dataKey="recovery"
                name="Recovery"
                stroke={CHART_COLORS.recovery}
                fillOpacity={1}
                fill="url(#colorRecovery)"
                activeDot={{ r: 6 }}
              />
            )}
            {selectedSources.protection && (
              <Area
                type="monotone"
                dataKey="protection"
                name="Protection"
                stroke={CHART_COLORS.protection}
                fillOpacity={1}
                fill="url(#colorProtection)"
                activeDot={{ r: 6 }}
              />
            )}
            {selectedSources.other && (
              <Area
                type="monotone"
                dataKey="other"
                name="Other"
                stroke={CHART_COLORS.other}
                fillOpacity={1}
                fill="url(#colorOther)"
                activeDot={{ r: 6 }}
              />
            )}
          </AreaChart>
        )
      default:
        return null
    }
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

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`
  }

  // Handle export data
  const handleExportData = (format) => {
    // In a real application, this would generate and download a report
    console.log(`Exporting data in ${format} format`)

    if (format === "csv") {
      // Example CSV export
      const headers = ["Date", "Revenue", "Expenses", "Profit", "Recovery", "Protection", "Other"]
      const csvContent = [
        headers.join(","),
        ...revenueData.map((item) =>
          [
            item.name,
            item.revenue.toFixed(2),
            item.expenses.toFixed(2),
            item.profit.toFixed(2),
            item.recovery.toFixed(2),
            item.protection.toFixed(2),
            item.other.toFixed(2),
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `earnings_report_${format(new Date(), "yyyy-MM-dd")}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings Analytics</h1>
          <p className="text-muted-foreground">Comprehensive overview of platform revenue and financial performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
{/* 
          {timeFilter === "custom" && (
            <DatePickerWithRange className="w-[300px]" date={dateRange} onDateChange={setDateRange} />
          )} */}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" title="Export Data">
                <Download className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Export Report</h4>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="justify-start" onClick={() => handleExportData("csv")}>
                    <FileText className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" onClick={() => handleExportData("pdf")}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleExportData("excel")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              dispatch(fetchEarnings())
              dispatch(fetchRequests())
            }}
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-indigo-500/10 to-indigo-700/10">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(financialData.totalRevenue.value)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span
                    className={`flex items-center ${financialData.totalRevenue.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {financialData.totalRevenue.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(financialData.totalRevenue.change).toFixed(1)}%
                  </span>
                  <span className="ml-1">from previous period</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="p-2 bg-muted/50">
            <div className="text-xs text-muted-foreground w-full">
              <div className="flex justify-between items-center">
                <span>Paid</span>
                <span className="font-medium">{formatCurrency(financialData.totalPaid.value)}</span>
              </div>
              <Progress
                value={
                  financialData.totalRevenue.value > 0
                    ? (financialData.totalPaid.value / financialData.totalRevenue.value) * 100
                    : 0
                }
                className="h-1 mt-1"
              />
            </div>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-emerald-500/10 to-emerald-700/10">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(financialData.netProfit.value)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span
                    className={`flex items-center ${financialData.netProfit.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {financialData.netProfit.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(financialData.netProfit.change).toFixed(1)}%
                  </span>
                  <span className="ml-1">from previous period</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="p-2 bg-muted/50">
            <div className="text-xs text-muted-foreground w-full">
              <div className="flex justify-between items-center">
                <span>Profit Margin</span>
                <span className="font-medium">{formatPercentage(financialData.kpis.profitMargin.value)}</span>
              </div>
              <Progress value={financialData.kpis.profitMargin.value} className="h-1 mt-1" />
            </div>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-red-500/10 to-red-700/10">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(financialData.expenses.value)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span
                    className={`flex items-center ${financialData.expenses.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {financialData.expenses.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(financialData.expenses.change).toFixed(1)}%
                  </span>
                  <span className="ml-1">from previous period</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="p-2 bg-muted/50">
            <div className="text-xs text-muted-foreground w-full">
              <div className="flex justify-between items-center">
                <span>Expense Ratio</span>
                <span className="font-medium">
                  {financialData.totalRevenue.value > 0
                    ? formatPercentage((financialData.expenses.value / financialData.totalRevenue.value) * 100)
                    : "0.0%"}
                </span>
              </div>
              <Progress
                value={
                  financialData.totalRevenue.value > 0
                    ? (financialData.expenses.value / financialData.totalRevenue.value) * 100
                    : 0
                }
                className="h-1 mt-1"
              />
            </div>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-500/10 to-amber-700/10">
            <CardTitle className="text-sm font-medium">Avg. Per Request</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(financialData.avgEarningPerRequest.value)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span
                    className={`flex items-center ${financialData.avgEarningPerRequest.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {financialData.avgEarningPerRequest.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(financialData.avgEarningPerRequest.change).toFixed(1)}%
                  </span>
                  <span className="ml-1">from previous period</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="p-2 bg-muted/50">
            <div className="text-xs text-muted-foreground w-full">
              <div className="flex justify-between items-center">
                <span>ROI</span>
                <span className="font-medium">{formatPercentage(financialData.kpis.roi.value)}</span>
              </div>
              <Progress value={Math.min(financialData.kpis.roi.value, 100)} className="h-1 mt-1" />
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Revenue Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span>Revenue Sources</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span>Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="kpis" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>KPIs</span>
          </TabsTrigger>
          <TabsTrigger value="earners" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Top Earners</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue, Expenses & Profit</CardTitle>
                  <CardDescription>Financial performance over time</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant={chartType === "area" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("area")}
                    className="h-8 px-2"
                  >
                    <AreaChart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === "line" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("line")}
                    className="h-8 px-2"
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                    className="h-8 px-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === "composed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("composed")}
                    className="h-8 px-2"
                    title="Composed Chart"
                  >
                    <Landmark className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[400px] pt-4">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading data...</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Acquisition Cost</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(financialData.kpis.cac.value)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span
                    className={`flex items-center ${financialData.kpis.cac.trend === "down" ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {financialData.kpis.cac.trend === "down" ? (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(financialData.kpis.cac.change).toFixed(1)}%
                  </span>
                  <span className="ml-1">from previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(financialData.kpis.cltv.value)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span
                    className={`flex items-center ${financialData.kpis.cltv.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {financialData.kpis.cltv.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(financialData.kpis.cltv.change).toFixed(1)}%
                  </span>
                  <span className="ml-1">from previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Return on Investment</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(financialData.kpis.roi.value)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span
                    className={`flex items-center ${financialData.kpis.roi.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {financialData.kpis.roi.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(financialData.kpis.roi.change).toFixed(1)}%
                  </span>
                  <span className="ml-1">from previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(financialData.kpis.profitMargin.value)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span
                    className={`flex items-center ${financialData.kpis.profitMargin.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {financialData.kpis.profitMargin.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(financialData.kpis.profitMargin.change).toFixed(1)}%
                  </span>
                  <span className="ml-1">from previous period</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Revenue by Source</CardTitle>
                    <CardDescription>Breakdown of revenue streams over time</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="recovery"
                        checked={selectedSources.recovery}
                        onCheckedChange={() => handleSourceChange("recovery")}
                      />
                      <label htmlFor="recovery" className="text-sm flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.recovery }}></div>
                        Recovery
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="protection"
                        checked={selectedSources.protection}
                        onCheckedChange={() => handleSourceChange("protection")}
                      />
                      <label htmlFor="protection" className="text-sm flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS.protection }}
                        ></div>
                        Protection
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="other"
                        checked={selectedSources.other}
                        onCheckedChange={() => handleSourceChange("other")}
                      />
                      <label htmlFor="other" className="text-sm flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.other }}></div>
                        Other
                      </label>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[400px] pt-4">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading data...</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.recovery} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={CHART_COLORS.recovery} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProtection" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.protection} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={CHART_COLORS.protection} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOther" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.other} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={CHART_COLORS.other} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis allowDecimals={false} stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {selectedSources.recovery && (
                        <Area
                          type="monotone"
                          dataKey="recovery"
                          name="Recovery"
                          stroke={CHART_COLORS.recovery}
                          fillOpacity={1}
                          fill="url(#colorRecovery)"
                          activeDot={{ r: 6 }}
                        />
                      )}
                      {selectedSources.protection && (
                        <Area
                          type="monotone"
                          dataKey="protection"
                          name="Protection"
                          stroke={CHART_COLORS.protection}
                          fillOpacity={1}
                          fill="url(#colorProtection)"
                          activeDot={{ r: 6 }}
                        />
                      )}
                      {selectedSources.other && (
                        <Area
                          type="monotone"
                          dataKey="other"
                          name="Other"
                          stroke={CHART_COLORS.other}
                          fillOpacity={1}
                          fill="url(#colorOther)"
                          activeDot={{ r: 6 }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>Breakdown by service type</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex-1 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="70%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Recovery", value: financialData.revenueBySource.recovery },
                              { name: "Protection", value: financialData.revenueBySource.protection },
                              { name: "Other", value: financialData.revenueBySource.other },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: "Recovery", value: financialData.revenueBySource.recovery },
                              { name: "Protection", value: financialData.revenueBySource.protection },
                              { name: "Other", value: financialData.revenueBySource.other },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index + 2]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4 mt-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS.recovery }}
                            ></div>
                            <span className="text-sm">Recovery</span>
                          </div>
                          <span className="text-sm font-medium">
                            {formatCurrency(financialData.revenueBySource.recovery)}
                          </span>
                        </div>
                        <Progress
                          value={
                            financialData.totalRevenue.value > 0
                              ? (financialData.revenueBySource.recovery / financialData.totalRevenue.value) * 100
                              : 0
                          }
                          className="h-1"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS.protection }}
                            ></div>
                            <span className="text-sm">Protection</span>
                          </div>
                          <span className="text-sm font-medium">
                            {formatCurrency(financialData.revenueBySource.protection)}
                          </span>
                        </div>
                        <Progress
                          value={
                            financialData.totalRevenue.value > 0
                              ? (financialData.revenueBySource.protection / financialData.totalRevenue.value) * 100
                              : 0
                          }
                          className="h-1"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.other }}></div>
                            <span className="text-sm">Other</span>
                          </div>
                          <span className="text-sm font-medium">
                            {formatCurrency(financialData.revenueBySource.other)}
                          </span>
                        </div>
                        <Progress
                          value={
                            financialData.totalRevenue.value > 0
                              ? (financialData.revenueBySource.other / financialData.totalRevenue.value) * 100
                              : 0
                          }
                          className="h-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Detailed analysis of revenue sources</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>% of Total</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Avg. Value</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[60px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[60px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS.recovery }}
                            ></div>
                            <span>Recovery Services</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(financialData.revenueBySource.recovery)}</TableCell>
                        <TableCell>
                          {financialData.totalRevenue.value > 0
                            ? formatPercentage(
                                (financialData.revenueBySource.recovery / financialData.totalRevenue.value) * 100,
                              )
                            : "0.0%"}
                        </TableCell>
                        <TableCell>{requests.filter((r) => r.requestType === "recovery").length}</TableCell>
                        <TableCell>
                          {formatCurrency(
                            requests.filter((r) => r.requestType === "recovery").length > 0
                              ? financialData.revenueBySource.recovery /
                                  requests.filter((r) => r.requestType === "recovery").length
                              : 0,
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                          >
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS.protection }}
                            ></div>
                            <span>Protection Services</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(financialData.revenueBySource.protection)}</TableCell>
                        <TableCell>
                          {financialData.totalRevenue.value > 0
                            ? formatPercentage(
                                (financialData.revenueBySource.protection / financialData.totalRevenue.value) * 100,
                              )
                            : "0.0%"}
                        </TableCell>
                        <TableCell>{requests.filter((r) => r.requestType === "protection").length}</TableCell>
                        <TableCell>
                          {formatCurrency(
                            requests.filter((r) => r.requestType === "protection").length > 0
                              ? financialData.revenueBySource.protection /
                                  requests.filter((r) => r.requestType === "protection").length
                              : 0,
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                          >
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.other }}></div>
                            <span>Other Services</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(financialData.revenueBySource.other)}</TableCell>
                        <TableCell>
                          {financialData.totalRevenue.value > 0
                            ? formatPercentage(
                                (financialData.revenueBySource.other / financialData.totalRevenue.value) * 100,
                              )
                            : "0.0%"}
                        </TableCell>
                        <TableCell>
                          {
                            requests.filter((r) => r.requestType !== "recovery" && r.requestType !== "protection")
                              .length
                          }
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            requests.filter((r) => r.requestType !== "recovery" && r.requestType !== "protection")
                              .length > 0
                              ? financialData.revenueBySource.other /
                                  requests.filter((r) => r.requestType !== "recovery" && r.requestType !== "protection")
                                    .length
                              : 0,
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400"
                          >
                            Growing
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Analysis of operational costs</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading data...</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Operational", value: financialData.expensesByCategory.operational },
                        { name: "Marketing", value: financialData.expensesByCategory.marketing },
                        { name: "Salaries", value: financialData.expensesByCategory.salaries },
                        { name: "Infrastructure", value: financialData.expensesByCategory.infrastructure },
                        { name: "Other", value: financialData.expensesByCategory.other },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar
                        dataKey="value"
                        fill={CHART_COLORS.expenses}
                        radius={[0, 4, 4, 0]}
                        label={{
                          position: "right",
                          formatter: (value) => formatCurrency(value),
                          fill: "#64748b",
                          fontSize: 12,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Distribution of expenses</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex-1 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="70%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Operational", value: financialData.expensesByCategory.operational },
                              { name: "Marketing", value: financialData.expensesByCategory.marketing },
                              { name: "Salaries", value: financialData.expensesByCategory.salaries },
                              { name: "Infrastructure", value: financialData.expensesByCategory.infrastructure },
                              { name: "Other", value: financialData.expensesByCategory.other },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: "Operational", value: financialData.expensesByCategory.operational },
                              { name: "Marketing", value: financialData.expensesByCategory.marketing },
                              { name: "Salaries", value: financialData.expensesByCategory.salaries },
                              { name: "Infrastructure", value: financialData.expensesByCategory.infrastructure },
                              { name: "Other", value: financialData.expensesByCategory.other },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="text-xs text-muted-foreground">
                        <div className="flex justify-between items-center mb-1">
                          <span>Total Expenses</span>
                          <span className="font-medium">{formatCurrency(financialData.expenses.value)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span>Expense Ratio</span>
                          <span className="font-medium">
                            {financialData.totalRevenue.value > 0
                              ? formatPercentage(
                                  (financialData.expenses.value / financialData.totalRevenue.value) * 100,
                                )
                              : "0.0%"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>Breakdown of operational costs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>% of Total</TableHead>
                    <TableHead>Monthly Average</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[60px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <>
                      <TableRow>
                        <TableCell className="font-medium">Operational</TableCell>
                        <TableCell>{formatCurrency(financialData.expensesByCategory.operational)}</TableCell>
                        <TableCell>
                          {formatPercentage(
                            (financialData.expensesByCategory.operational / financialData.expenses.value) * 100,
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(financialData.expensesByCategory.operational / 12)}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                          >
                            On Budget
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Marketing</TableCell>
                        <TableCell>{formatCurrency(financialData.expensesByCategory.marketing)}</TableCell>
                        <TableCell>
                          {formatPercentage(
                            (financialData.expensesByCategory.marketing / financialData.expenses.value) * 100,
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(financialData.expensesByCategory.marketing / 12)}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400"
                          >
                            Increasing
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Salaries</TableCell>
                        <TableCell>{formatCurrency(financialData.expensesByCategory.salaries)}</TableCell>
                        <TableCell>
                          {formatPercentage(
                            (financialData.expensesByCategory.salaries / financialData.expenses.value) * 100,
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(financialData.expensesByCategory.salaries / 12)}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                          >
                            On Budget
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Infrastructure</TableCell>
                        <TableCell>{formatCurrency(financialData.expensesByCategory.infrastructure)}</TableCell>
                        <TableCell>
                          {formatPercentage(
                            (financialData.expensesByCategory.infrastructure / financialData.expenses.value) * 100,
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(financialData.expensesByCategory.infrastructure / 12)}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                          >
                            Over Budget
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Other</TableCell>
                        <TableCell>{formatCurrency(financialData.expensesByCategory.other)}</TableCell>
                        <TableCell>
                          {formatPercentage(
                            (financialData.expensesByCategory.other / financialData.expenses.value) * 100,
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(financialData.expensesByCategory.other / 12)}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                          >
                            On Budget
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition Cost (CAC)</CardTitle>
                <CardDescription>Cost to acquire a new customer</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold">{formatCurrency(financialData.kpis.cac.value)}</div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span
                          className={`flex items-center ${financialData.kpis.cac.trend === "down" ? "text-emerald-500" : "text-red-500"}`}
                        >
                          {financialData.kpis.cac.trend === "down" ? (
                            <ArrowDownRight className="mr-1 h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                          )}
                          {Math.abs(financialData.kpis.cac.change).toFixed(1)}%
                        </span>
                        <span className="ml-1">from previous period</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <p>
                        Customer Acquisition Cost (CAC) is the cost associated with acquiring a new customer, including
                        marketing and sales expenses.
                      </p>
                      <p className="mt-2">A lower CAC indicates more efficient customer acquisition.</p>
                    </div>

                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { month: "Jan", cac: 28 },
                            { month: "Feb", cac: 27 },
                            { month: "Mar", cac: 26 },
                            { month: "Apr", cac: 28 },
                            { month: "May", cac: 27 },
                            { month: "Jun", cac: 25 },
                            { month: "Jul", cac: 26 },
                            { month: "Aug", cac: 25 },
                            { month: "Sep", cac: 24 },
                            { month: "Oct", cac: 25 },
                            { month: "Nov", cac: 24 },
                            { month: "Dec", cac: 25 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Line type="monotone" dataKey="cac" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value (CLTV)</CardTitle>
                <CardDescription>Total value a customer brings over their lifetime</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold">{formatCurrency(financialData.kpis.cltv.value)}</div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span
                          className={`flex items-center ${financialData.kpis.cltv.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                        >
                          {financialData.kpis.cltv.trend === "up" ? (
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-4 w-4" />
                          )}
                          {Math.abs(financialData.kpis.cltv.change).toFixed(1)}%
                        </span>
                        <span className="ml-1">from previous period</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <p>
                        Customer Lifetime Value (CLTV) represents the total revenue a business can expect from a single
                        customer throughout their relationship.
                      </p>
                      <p className="mt-2">A higher CLTV indicates stronger customer relationships and retention.</p>
                    </div>

                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { month: "Jan", cltv: 110 },
                            { month: "Feb", cltv: 112 },
                            { month: "Mar", cltv: 115 },
                            { month: "Apr", cltv: 114 },
                            { month: "May", cltv: 116 },
                            { month: "Jun", cltv: 118 },
                            { month: "Jul", cltv: 117 },
                            { month: "Aug", cltv: 119 },
                            { month: "Sep", cltv: 120 },
                            { month: "Oct", cltv: 118 },
                            { month: "Nov", cltv: 120 },
                            { month: "Dec", cltv: 120 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Line type="monotone" dataKey="cltv" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Return on Investment (ROI)</CardTitle>
                <CardDescription>Profitability ratio relative to investment</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold">{formatPercentage(financialData.kpis.roi.value)}</div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span
                          className={`flex items-center ${financialData.kpis.roi.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                        >
                          {financialData.kpis.roi.trend === "up" ? (
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-4 w-4" />
                          )}
                          {Math.abs(financialData.kpis.roi.change).toFixed(1)}%
                        </span>
                        <span className="ml-1">from previous period</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <p>
                        Return on Investment (ROI) measures the profitability of an investment relative to its cost.
                      </p>
                      <p className="mt-2">A higher ROI indicates more efficient use of capital.</p>
                    </div>

                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { month: "Jan", roi: 145 },
                            { month: "Feb", roi: 148 },
                            { month: "Mar", roi: 152 },
                            { month: "Apr", roi: 150 },
                            { month: "May", roi: 155 },
                            { month: "Jun", roi: 158 },
                            { month: "Jul", roi: 156 },
                            { month: "Aug", roi: 160 },
                            { month: "Sep", roi: 162 },
                            { month: "Oct", roi: 158 },
                            { month: "Nov", roi: 160 },
                            { month: "Dec", roi: 165 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Line type="monotone" dataKey="roi" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Margin</CardTitle>
                <CardDescription>Percentage of revenue that is profit</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold">
                        {formatPercentage(financialData.kpis.profitMargin.value)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span
                          className={`flex items-center ${financialData.kpis.profitMargin.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
                        >
                          {financialData.kpis.profitMargin.trend === "up" ? (
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-4 w-4" />
                          )}
                          {Math.abs(financialData.kpis.profitMargin.change).toFixed(1)}%
                        </span>
                        <span className="ml-1">from previous period</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <p>
                        Profit Margin measures the percentage of revenue that exceeds costs, indicating how efficiently
                        a company converts revenue into profit.
                      </p>
                      <p className="mt-2">
                        A higher profit margin indicates better financial health and operational efficiency.
                      </p>
                    </div>

                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { month: "Jan", margin: 58 },
                            { month: "Feb", margin: 57 },
                            { month: "Mar", margin: 59 },
                            { month: "Apr", margin: 58 },
                            { month: "May", margin: 60 },
                            { month: "Jun", margin: 59 },
                            { month: "Jul", margin: 58 },
                            { month: "Aug", margin: 60 },
                            { month: "Sep", margin: 61 },
                            { month: "Oct", margin: 60 },
                            { month: "Nov", margin: 59 },
                            { month: "Dec", margin: 60 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Line type="monotone" dataKey="margin" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Earners Tab */}
        <TabsContent value="earners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Earning Handlers</CardTitle>
              <CardDescription>Handlers with the highest earnings in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                      <Skeleton className="h-8 w-[100px]" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {topEarners.map((earner) => (
                    <div key={earner.handler._id} className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={`/placeholder.svg?height=48&width=48`} alt={earner.handler.username} />
                        <AvatarFallback>{getUserInitials(earner.handler.username)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{earner.handler.username}</h4>
                          <Badge variant="outline" className="text-xs">
                            Rank #{earner.rank}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            <span>{earner.requestCount} requests</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Coins className="h-3 w-3" />
                            <span>{formatCurrency(earner.avgEarningPerRequest)} avg</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(earner.totalEarnings)}</div>
                        <div className="text-sm text-muted-foreground flex items-center justify-end gap-2">
                          <span className="text-emerald-500">{formatCurrency(earner.paidEarnings)}</span>
                          <span>|</span>
                          <span className="text-amber-500">{formatCurrency(earner.pendingEarnings)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Distribution</CardTitle>
                <CardDescription>Comparison of top earners</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading data...</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topEarners.map((earner) => ({
                        name: earner.handler.username,
                        paid: earner.paidEarnings,
                        pending: earner.pendingEarnings,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="paid" name="Paid Earnings" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="pending" name="Pending Earnings" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earnings Efficiency</CardTitle>
                <CardDescription>Average earnings per request</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading data...</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={topEarners.map((earner) => ({
                        name: earner.handler.username,
                        avg: earner.avgEarningPerRequest,
                        total: earner.totalEarnings,
                        count: earner.requestCount,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" tickFormatter={(value) => `$${value}`} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `$${value}`} />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "avg" ? formatCurrency(value) : name === "count" ? value : formatCurrency(value),
                          name === "avg" ? "Avg per Request" : name === "count" ? "Request Count" : "Total Earnings",
                        ]}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="avg" name="Avg per Request" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="total"
                        name="Total Earnings"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Scatter yAxisId="left" dataKey="count" name="Request Count" fill="#f59e0b" shape="circle" />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

