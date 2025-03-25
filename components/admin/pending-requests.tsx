"use client"

import { useEffect, useState } from "react"
import {
  Clock,
  Search,
  Filter,
  Eye,
  Download,
  ChevronDown,
  Edit,
  FileSpreadsheet,
  Calendar,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Shield,
  Key,
  Play,
  Send,
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
import { EditRequestDialog } from "./edit-request"
import { exportRequestsToExcel, exportRequestToExcel } from "@/lib/excel-export"
import SendMessageModal from "./send-email"
import { formatTimeAgo } from "@/lib/date-utils"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Define sort types
type SortField = "createdAt" | "piUnlockTime" | "status" | "none"
type SortDirection = "asc" | "desc"

export default function AdminPendingRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [unlockTimeFilter, setUnlockTimeFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view")
  const [isExporting, setIsExporting] = useState(false)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [amount, setAmount] = useState(0)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const { requests } = useAppSelector((state) => state.requests)
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
    return (
      <Badge className="bg-amber-500">
        <Clock className="mr-1 h-3 w-3" /> Pending
      </Badge>
    )
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

  const handleUpdateStatus = async (requestId: string, newStatus: string, type: "recovery" | "protection") => {
    try {
      if (newStatus === "failed" && !rejectReason) {
        alert("Please provide a reason for rejection.")
        return
      }
      if (newStatus === "failed") {
        await dispatch(updateRequestStatus({ requestId, action: newStatus, rejectReason })).unwrap()
      } else if (newStatus === "completed" && type === "protection") {
        await dispatch(updateRequestStatus({ requestId, action: newStatus, amount })).unwrap()
      } else if (newStatus === "completed" && type === "recovery") {
        await dispatch(updateRequestStatus({ requestId, action: newStatus, passphrase, amount })).unwrap()
      } else {
        await dispatch(updateRequestStatus({ requestId, action: newStatus })).unwrap()
      }

      return true
    } catch (error) {
      console.error("Failed to update status:", error)
      throw error
    }
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

  const handleSendMessage = (request: any) => {
    setSelectedRequest(request)
    setMessageModalOpen(true)
  }

  const handleExportPendingRequests = async () => {
    try {
      setIsExporting(true)
      const dataToExport =
        pendingRequests.length > 0 ? (searchTerm || typeFilter !== "all" ? filteredRequests : pendingRequests) : []

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

  // Filter only pending requests
  const pendingRequests = requests.filter((request) => request.status === "pending")

  // Apply additional filters
  const filteredRequests = pendingRequests
    .filter((request) => {
      const matchesSearch =
        request._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase())

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

      return matchesSearch && matchesType && matchesCountry && matchesUnlockTime
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

      return 0
    })

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pending Requests</h1>

        <Button
          onClick={handleExportPendingRequests}
          disabled={isExporting || pendingRequests.length === 0}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isExporting
            ? "Exporting..."
            : `Export ${filteredRequests.length !== pendingRequests.length ? "Filtered" : "All"} (${filteredRequests.length})`}
        </Button>
      </div>

      <Card className="my-6">
        <CardHeader>
          <CardTitle>Pending Requests Summary</CardTitle>
          <CardDescription>View and manage all requests awaiting review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, email, username"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
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

            {/* Pending Requests Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("createdAt")}>
                      <div className="flex items-center">Requested {getSortIcon("createdAt")}</div>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("piUnlockTime")}>
                      <div className="flex items-center">Unlock Time {getSortIcon("piUnlockTime")}</div>
                    </TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell className="font-medium">{request.user?.username || "N/A"}</TableCell>
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
                        <TableCell>{formatTimeAgo(request.createdAt)}</TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.requestType === "protection" && request.piUnlockTime
                            ? formatDate(request.piUnlockTime)
                            : "N/A"}
                        </TableCell>
                        <TableCell>{request.piBalance ? `${request.piBalance} π` : "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleUpdateStatus(request._id, "processing", request.requestType)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Process
                            </Button> */}

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
                                <DropdownMenuItem onClick={() => handleSendMessage(request)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                        No pending requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
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
          setRejectReason={setRejectReason}
          rejectReason={rejectReason}
          amount={amount}
          setAmount={setAmount}
          passphrase={passphrase}
          setPassphrase={setPassphrase}
        />
      )}

      {selectedRequest && (
        <SendMessageModal
          isOpen={messageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          recipientEmail={selectedRequest.email}
          recipientName={selectedRequest.user?.username}
          requestType={selectedRequest.requestType}
          requestId={selectedRequest._id}
        />
      )}
    </div>
  )
}

