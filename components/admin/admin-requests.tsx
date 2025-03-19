"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Key,
  Search,
  Filter,
  Play,
  Eye,
  Download,
  ChevronDown,
  Edit,
  FileSpreadsheet,
  Calendar,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchRequests, updateRequestStatus } from "@/redux/slices/requests"
import { usePathname } from "next/navigation"
import { EditRequestDialog } from "./edit-request"
import { exportRequestsToExcel, exportRequestToExcel } from "@/lib/excel-export"



// Define sort types
type SortField = "createdAt" | "piUnlockTime" | "status" | "none"
type SortDirection = "asc" | "desc"

export default function AdminRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [unlockTimeFilter, setUnlockTimeFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view")
  const [isExporting, setIsExporting] = useState(false)

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("none")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const { requests } = useAppSelector((state) => state.requests)
  const pathname = usePathname()

  const isRequest = pathname.startsWith("/control-panel-x7z9q/requests")

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchRequests())
  }, [dispatch])

  const formatDate = (dateString: Date) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
    return new Intl.DateTimeFormat("en-GB", options).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" /> Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-500">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" /> Processing
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" /> Failed
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const openViewDialog = (request: any) => {
    setSelectedRequest(request)
    setDialogMode("view")
    setDialogOpen(true)
  }

  const openEditDialog = (request: any) => {
    setSelectedRequest(request)
    setDialogMode("edit")
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setSelectedRequest(null)
  }

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      await dispatch(updateRequestStatus({ requestId, action: newStatus })).unwrap()
      
    
      return true
    } catch (error) {
      console.error("Failed to update status:", error)
     
      throw error
    }
  }

  const handleRunScript = (request: any) => {
    
    // Implement script running logic here
  }

  const handleExportSingleRequest = (request: any) => {
    try {
      setIsExporting(true)
      exportRequestToExcel(request)
     
    } catch (error) {
      console.error("Export failed:", error)
      
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAllRequests = async () => {
    try {
      setIsExporting(true)
      // Use filtered requests if filters are applied, otherwise use all requests
      const dataToExport =
        filteredRequests.length > 0 &&
        (searchTerm ||
          statusFilter !== "all" ||
          typeFilter !== "all" ||
          countryFilter !== "all" ||
          unlockTimeFilter !== "all")
          ? filteredRequests
          : requests

      if (dataToExport.length === 0) {
       
        return
      }

      exportRequestsToExcel(dataToExport)

      
    } catch (error) {
      console.error("Export failed:", error)
      
    } finally {
      setIsExporting(false)
    }
  }

  // Check if a date is within the specified range from now
  const isDateWithinRange = (date: Date | string | undefined, days: number): boolean => {
    if (!date) return false

    const unlockDate = new Date(date)
    const now = new Date()

    // Calculate the difference in days
    const diffTime = unlockDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays >= 0 && diffDays <= days
  }

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new field and default to descending (newest first)
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Get sort icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground" />
    }

    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
  }

  // Filter requests
  const filteredRequests = requests
    .filter((request) => {
      const matchesSearch =
        request._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || request.status === statusFilter
      const matchesType = typeFilter === "all" || request.requestType === typeFilter
      const matchesCountry = countryFilter === "all" || request.country === countryFilter

      // Filter by unlock time
      let matchesUnlockTime = true
      if (unlockTimeFilter !== "all") {
        // Only apply to protection requests
        if (request.requestType === "protection") {
          switch (unlockTimeFilter) {
            case "today":
              matchesUnlockTime = isDateWithinRange(request.piUnlockTime, 1)
              break
            case "week":
              matchesUnlockTime = isDateWithinRange(request.piUnlockTime, 7)
              break
            case "month":
              matchesUnlockTime = isDateWithinRange(request.piUnlockTime, 30)
              break
            default:
              matchesUnlockTime = true
          }
        } else {
          // For recovery requests, don't apply unlock time filter
          matchesUnlockTime = unlockTimeFilter === "none"
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesCountry && matchesUnlockTime
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortField === "none") return 0

      // Handle sorting by unlock time
      if (sortField === "piUnlockTime") {
        // First, separate protection and recovery requests
        if (a.requestType === "protection" && b.requestType !== "protection") {
          // Protection requests always come first when sorting by unlock time
          return -1
        }
        if (a.requestType !== "protection" && b.requestType === "protection") {
          // Recovery requests always come last when sorting by unlock time
          return 1
        }

        // If both are protection requests, sort by unlock time
        if (a.requestType === "protection" && b.requestType === "protection") {
          // Handle cases where one or both protection requests don't have unlock time
          if (!a.piUnlockTime && !b.piUnlockTime) return 0
          if (!a.piUnlockTime) return sortDirection === "asc" ? -1 : 1
          if (!b.piUnlockTime) return sortDirection === "asc" ? 1 : -1

          // Compare dates
          const dateA = new Date(a.piUnlockTime).getTime()
          const dateB = new Date(b.piUnlockTime).getTime()

          return sortDirection === "asc"
            ? dateA - dateB // Ascending: earliest first
            : dateB - dateA // Descending: latest first
        }

        // If both are recovery requests, maintain their original order
        return 0
      }

      // Handle sorting by created date
      if (sortField === "createdAt") {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()

        return sortDirection === "asc"
          ? dateA - dateB // Ascending: earliest first
          : dateB - dateA // Descending: latest first
      }

      // Handle sorting by status
      if (sortField === "status") {
        // Define status order for sorting
        const statusOrder = {
          pending: 1,
          processing: 2,
          completed: 3,
          failed: 4,
        }

        const statusA = statusOrder[a.status as keyof typeof statusOrder] || 0
        const statusB = statusOrder[b.status as keyof typeof statusOrder] || 0

        return sortDirection === "asc" ? statusA - statusB : statusB - statusA
      }

      return 0
    })

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold"> {isRequest ? "Request Management" : "Recent Requests"} </h1>

        {isRequest && (
          <Button onClick={handleExportAllRequests} disabled={isExporting || requests.length === 0} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {isExporting
              ? "Exporting..."
              : `Export ${filteredRequests.length !== requests.length ? "Filtered" : "All"} (${filteredRequests.length})`}
          </Button>
        )}
      </div>

      <Card className="my-6">
        {isRequest ? (
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
            <CardDescription>View and manage all recovery and protection requests</CardDescription>
          </CardHeader>
        ) : (
          <CardHeader></CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, email"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Status</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Type</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="recovery">Recovery</SelectItem>
                    <SelectItem value="protection">Protection</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={unlockTimeFilter} onValueChange={setUnlockTimeFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Unlock Time</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Unlock Times</SelectItem>
                    <SelectItem value="today">Unlocking Today</SelectItem>
                    <SelectItem value="week">Unlocking This Week</SelectItem>
                    <SelectItem value="month">Unlocking This Month</SelectItem>
                    <SelectItem value="none">No Unlock Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Requests Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("createdAt")}>
                      <div className="flex items-center">Date {getSortIcon("createdAt")}</div>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("status")}>
                      <div className="flex items-center">Status {getSortIcon("status")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("piUnlockTime")}>
                      <div className="flex items-center">Unlock Time {getSortIcon("piUnlockTime")}</div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell className="font-medium">{request.user.username}</TableCell>
                        <TableCell>
                          {request.requestType === "recovery" ? (
                            <div className="flex items-center">
                              <Key className="h-4 w-4 mr-1 text-primary" />
                              <span>Recovery</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 mr-1 text-primary" />
                              <span>Protection</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(request.createdAt)}</TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.requestType === "protection" && request.piUnlockTime
                            ? formatDate(request.piUnlockTime)
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {(request.status === "pending" || request.status === "processing") && (
                              <Button size="sm" variant="default" onClick={() => handleRunScript(request)}>
                                <Play className="h-4 w-4 mr-1" />
                                Run Script
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openViewDialog(request)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(request)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Status
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportSingleRequest(request)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export Data
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">Cancel Request</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No requests found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedRequest && (
        <EditRequestDialog
          isOpen={dialogOpen}
          onClose={closeDialog}
          request={selectedRequest}
          mode={dialogMode}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  )
}

