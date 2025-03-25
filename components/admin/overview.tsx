//@ts-nocheck

"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { getAllUsers } from "@/redux/slices/auth"
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
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Shield,
  Key,
  UserCheck,
  TrendingUp,
  BarChart3,
  LineChartIcon,
  Download,
  RefreshCw,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminOverviewEnhanced() {
  const [timeFilter, setTimeFilter] = useState("month")
  const [chartType, setChartType] = useState("area")
  const [isLoading, setIsLoading] = useState(true)
  const [registrationData, setRegistrationData] = useState([])
  const [topUsers, setTopUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalRequests: 0,
    activeUsers: 0,
    recoveryRequests: 0,
    protectionRequests: 0,
    userGrowth: 0,
    requestGrowth: 0,
    completionRate: 0,
    avgRequestsPerUser: 0,
    dailyActiveUsers: 0,
  })

  const dispatch = useAppDispatch()
  const { users } = useAppSelector((state) => state.auth)
  const { requests } = useAppSelector((state) => state.requests)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([dispatch(getAllUsers()), dispatch(fetchRequests())])
      setIsLoading(false)
    }

    fetchData()
  }, [dispatch])

  useEffect(() => {
    if (users.length > 0 && requests.length > 0) {
      processData()
    }
  }, [users, requests, timeFilter])

  const processData = () => {
    // Calculate date range based on filter
    const now = new Date()
    const dates = []
    let startDate = new Date()

    switch (timeFilter) {
      case "today":
        startDate.setHours(0, 0, 0, 0)
        for (let i = 0; i < 24; i++) {
          const date = new Date(startDate)
          date.setHours(i)
          dates.push({
            date,
            label: `${i}:00`,
          })
        }
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        for (let i = 0; i <= 7; i++) {
          const date = new Date(startDate)
          date.setDate(startDate.getDate() + i)
          dates.push({
            date,
            label: date.toLocaleDateString("en-US", { weekday: "short" }),
          })
        }
        break
      case "15days":
        startDate.setDate(now.getDate() - 15)
        for (let i = 0; i <= 15; i++) {
          const date = new Date(startDate)
          date.setDate(startDate.getDate() + i)
          dates.push({
            date,
            label: `${date.getDate()}/${date.getMonth() + 1}`,
          })
        }
        break
      case "month":
        startDate.setDate(1) // First day of current month
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        for (let i = 1; i <= lastDay; i++) {
          const date = new Date(now.getFullYear(), now.getMonth(), i)
          dates.push({
            date,
            label: `${i}`,
          })
        }
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1) // January 1st of current year
        for (let i = 0; i < 12; i++) {
          const date = new Date(now.getFullYear(), i, 1)
          dates.push({
            date,
            label: date.toLocaleDateString("en-US", { month: "short" }),
          })
        }
        break
    }

    // Process registration data
    const registrations = dates.map(({ date, label }) => {
      let userCount = 0
      let requestCount = 0

      if (timeFilter === "today") {
        // Count by hour for today
        userCount = users.filter((user) => {
          const userDate = new Date(user.createdAt)
          return (
            userDate.getDate() === date.getDate() &&
            userDate.getMonth() === date.getMonth() &&
            userDate.getFullYear() === date.getFullYear() &&
            userDate.getHours() === date.getHours()
          )
        }).length

        requestCount = requests.filter((request) => {
          const requestDate = new Date(request.createdAt)
          return (
            requestDate.getDate() === date.getDate() &&
            requestDate.getMonth() === date.getMonth() &&
            requestDate.getFullYear() === date.getFullYear() &&
            requestDate.getHours() === date.getHours()
          )
        }).length
      } else if (timeFilter === "year") {
        // Count by month for year
        userCount = users.filter((user) => {
          const userDate = new Date(user.createdAt)
          return userDate.getMonth() === date.getMonth() && userDate.getFullYear() === date.getFullYear()
        }).length

        requestCount = requests.filter((request) => {
          const requestDate = new Date(request.createdAt)
          return requestDate.getMonth() === date.getMonth() && requestDate.getFullYear() === date.getFullYear()
        }).length
      } else {
        // Count by day for week, 15days, month
        userCount = users.filter((user) => {
          const userDate = new Date(user.createdAt)
          return (
            userDate.getDate() === date.getDate() &&
            userDate.getMonth() === date.getMonth() &&
            userDate.getFullYear() === date.getFullYear()
          )
        }).length

        requestCount = requests.filter((request) => {
          const requestDate = new Date(request.createdAt)
          return (
            requestDate.getDate() === date.getDate() &&
            requestDate.getMonth() === date.getMonth() &&
            requestDate.getFullYear() === date.getFullYear()
          )
        }).length
      }

      return {
        name: label,
        users: userCount,
        requests: requestCount,
      }
    })

    setRegistrationData(registrations)

    // Calculate top users by request count
    const userRequestCounts = {}
    const userRequestTypes = {}

    requests.forEach((request) => {
      const username = request.user?.username
      if (username) {
        userRequestCounts[username] = (userRequestCounts[username] || 0) + 1

        // Track request types per user
        if (!userRequestTypes[username]) {
          userRequestTypes[username] = { recovery: 0, protection: 0 }
        }
        if (request.requestType === "recovery") {
          userRequestTypes[username].recovery++
        } else if (request.requestType === "protection") {
          userRequestTypes[username].protection++
        }
      }
    })

    const sortedUsers = Object.entries(userRequestCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([username, count], index) => {
        const user = users.find((u) => u.username === username) || {}
        const types = userRequestTypes[username] || { recovery: 0, protection: 0 }

        // Calculate completion rate for this user
        const userRequests = requests.filter((r) => r.user?.username === username)
        const completedRequests = userRequests.filter((r) => r.status === "completed").length
        const completionRate = userRequests.length > 0 ? Math.round((completedRequests / userRequests.length) * 100) : 0

        return {
          id: index + 1,
          username,
          count,
          recoveryCount: types.recovery,
          protectionCount: types.protection,
          completionRate,
          createdAt: user.createdAt,
        }
      })

    setTopUsers(sortedUsers)

    // Calculate overall stats
    const previousPeriodStart = new Date(startDate)
    previousPeriodStart.setDate(
      previousPeriodStart.getDate() -
        (timeFilter === "year"
          ? 365
          : timeFilter === "month"
            ? 30
            : timeFilter === "15days"
              ? 15
              : timeFilter === "week"
                ? 7
                : 1),
    )

    const newUsers = users.filter((user) => {
      const userDate = new Date(user.createdAt)
      return userDate >= startDate && userDate <= now
    }).length

    const previousPeriodUsers = users.filter((user) => {
      const userDate = new Date(user.createdAt)
      return userDate >= previousPeriodStart && userDate < startDate
    }).length

    const userGrowth =
      previousPeriodUsers === 0 ? 100 : Math.round(((newUsers - previousPeriodUsers) / previousPeriodUsers) * 100)

    const currentPeriodRequests = requests.filter((request) => {
      const requestDate = new Date(request.createdAt)
      return requestDate >= startDate && requestDate <= now
    }).length

    const previousPeriodRequests = requests.filter((request) => {
      const requestDate = new Date(request.createdAt)
      return requestDate >= previousPeriodStart && requestDate < startDate
    }).length

    const requestGrowth =
      previousPeriodRequests === 0
        ? 100
        : Math.round(((currentPeriodRequests - previousPeriodRequests) / previousPeriodRequests) * 100)

    // Count active users (users who have made at least one request)
    const activeUserCount = new Set(requests.map((request) => request.user?.username).filter(Boolean)).size

    // Count request types
    const recoveryRequests = requests.filter((request) => request.requestType === "recovery").length
    const protectionRequests = requests.filter((request) => request.requestType === "protection").length

    // Calculate completion rate
    const completedRequests = requests.filter((request) => request.status === "completed").length
    const completionRate = requests.length > 0 ? Math.round((completedRequests / requests.length) * 100) : 0

    // Calculate average requests per user
    const avgRequestsPerUser = activeUserCount > 0 ? Math.round((requests.length / activeUserCount) * 10) / 10 : 0

    // Calculate daily active users (users with activity in the last 24 hours)
    const oneDayAgo = new Date(now)
    oneDayAgo.setDate(now.getDate() - 1)

    const dailyActiveUsers = new Set(
      requests
        .filter((request) => new Date(request.createdAt) >= oneDayAgo)
        .map((request) => request.user?.username)
        .filter(Boolean),
    ).size

    setStats({
      totalUsers: users.length,
      newUsers,
      totalRequests: requests.length,
      activeUsers: activeUserCount,
      recoveryRequests,
      protectionRequests,
      userGrowth,
      requestGrowth,
      completionRate,
      avgRequestsPerUser,
      dailyActiveUsers,
    })
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
      return (
        <div className="bg-background p-4 border rounded-md shadow-md">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span>
                {entry.name}: <span className="font-semibold">{entry.value}</span>
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
    users: "#6366f1",
    requests: "#10b981",
    recovery: "#f59e0b",
    protection: "#8b5cf6",
  }

  // Render the appropriate chart based on the selected type
  const renderChart = () => {
    switch (chartType) {
      case "area":
        return (
          <AreaChart data={registrationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.users} stopOpacity={0.8} />
                <stop offset="95%" stopColor={CHART_COLORS.users} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.requests} stopOpacity={0.8} />
                <stop offset="95%" stopColor={CHART_COLORS.requests} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              interval={timeFilter === "month" && registrationData.length > 15 ? 2 : 0}
              stroke="#94a3b8"
            />
            <YAxis allowDecimals={false} stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="users"
              name="New Users"
              stroke={CHART_COLORS.users}
              fillOpacity={1}
              fill="url(#colorUsers)"
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="requests"
              name="New Requests"
              stroke={CHART_COLORS.requests}
              fillOpacity={1}
              fill="url(#colorRequests)"
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        )
      case "line":
        return (
          <LineChart data={registrationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              interval={timeFilter === "month" && registrationData.length > 15 ? 2 : 0}
              stroke="#94a3b8"
            />
            <YAxis allowDecimals={false} stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              name="New Users"
              stroke={CHART_COLORS.users}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="requests"
              name="New Requests"
              stroke={CHART_COLORS.requests}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )
      case "bar":
        return (
          <BarChart data={registrationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              interval={timeFilter === "month" && registrationData.length > 15 ? 2 : 0}
              stroke="#94a3b8"
            />
            <YAxis allowDecimals={false} stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="users" name="New Users" fill={CHART_COLORS.users} radius={[4, 4, 0, 0]} />
            <Bar dataKey="requests" name="New Requests" fill={CHART_COLORS.requests} radius={[4, 4, 0, 0]} />
          </BarChart>
        )
      default:
        return null
    }
  }

  // Calculate request type distribution for radar chart
  const requestTypeData = useMemo(() => {
    if (!requests.length) return []

    const statusCounts = {
      pending: requests.filter((r) => r.status === "pending").length,
      processing: requests.filter((r) => r.status === "processing").length,
      completed: requests.filter((r) => r.status === "completed").length,
      failed: requests.filter((r) => r.status === "failed").length,
    }

    return [
      { subject: "Pending", A: statusCounts.pending, fullMark: requests.length },
      { subject: "Processing", A: statusCounts.processing, fullMark: requests.length },
      { subject: "Completed", A: statusCounts.completed, fullMark: requests.length },
      { subject: "Failed", A: statusCounts.failed, fullMark: requests.length },
    ]
  }, [requests])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          {/* <p className="text-muted-foreground">
            Comprehensive overview of your platform's user activity and statistics
          </p> */}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="15days">Last 15 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              dispatch(getAllUsers())
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
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span className={`flex items-center ${stats.userGrowth >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {stats.userGrowth >= 0 ? (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(stats.userGrowth)}%
                  </span>
                  <span className="ml-1">from previous period</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="p-2 bg-muted/50">
            <div className="text-xs text-muted-foreground w-full">
              <div className="flex justify-between items-center">
                <span>New users</span>
                <span className="font-medium">{stats.newUsers}</span>
              </div>
              <Progress value={(stats.newUsers / (stats.totalUsers || 1)) * 100} className="h-1 mt-1" />
            </div>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-emerald-500/10 to-emerald-700/10">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span
                    className={`flex items-center ${stats.requestGrowth >= 0 ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {stats.requestGrowth >= 0 ? (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(stats.requestGrowth)}%
                  </span>
                  <span className="ml-1">from previous period</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="p-2 bg-muted/50">
            <div className="text-xs text-muted-foreground w-full">
              <div className="flex justify-between items-center">
                <span>Completion rate</span>
                <span className="font-medium">{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-1 mt-1" />
            </div>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-500/10 to-amber-700/10">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>{stats.dailyActiveUsers} users active today</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="p-2 bg-muted/50">
            <div className="text-xs text-muted-foreground w-full">
              <div className="flex justify-between items-center">
                <span>Engagement rate</span>
                <span className="font-medium">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0}
                className="h-1 mt-1"
              />
            </div>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-500/10 to-purple-700/10">
            <CardTitle className="text-sm font-medium">Request Types</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.avgRequestsPerUser}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>Avg. requests per user</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="p-2 bg-muted/50">
            <div className="text-xs text-muted-foreground w-full">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Key className="h-3 w-3 mr-1 text-amber-500" />
                  <span>Recovery</span>
                </div>
                <span className="font-medium">{stats.recoveryRequests}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center">
                  <Shield className="h-3 w-3 mr-1 text-purple-500" />
                  <span>Protection</span>
                </div>
                <span className="font-medium">{stats.protectionRequests}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Registration Graph */}
        <Card className="md:col-span-5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Activity Trends</CardTitle>
                <CardDescription>Registration and request activity over time</CardDescription>
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
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

        {/* Request Status Distribution */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Request Status</CardTitle>
            <CardDescription>Distribution of request statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading data...</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={requestTypeData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
                  <Radar name="Requests" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Users by Request Count</CardTitle>
              <CardDescription>Users with the highest number of requests</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topUsers.map((user) => ({
                      name: user.username,
                      recovery: user.recoveryCount,
                      protection: user.protectionCount,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" scale="band" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="recovery"
                      name="Recovery Requests"
                      stackId="a"
                      fill={CHART_COLORS.recovery}
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="protection"
                      name="Protection Requests"
                      stackId="a"
                      fill={CHART_COLORS.protection}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div className="space-y-5">
                  {topUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={user.username} />
                        <AvatarFallback>{getUserInitials(user.username)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">{user.username}</p>
                          <Badge variant="outline" className="text-xs">
                            Rank #{user.id}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center">
                            <Key className="mr-1 h-3 w-3 text-amber-500" />
                            <span>{user.recoveryCount} recovery</span>
                          </div>
                          <div className="flex items-center">
                            <Shield className="mr-1 h-3 w-3 text-purple-500" />
                            <span>{user.protectionCount} protection</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{user.count}</span>
                        </div>
                        <div className="w-24">
                          <div className="flex justify-between text-xs">
                            <span>Completion</span>
                            <span>{user.completionRate}%</span>
                          </div>
                          <Progress value={user.completionRate} className="h-1 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

