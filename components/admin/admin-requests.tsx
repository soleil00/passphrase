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
  Eye,
  Download,
  ChevronDown,
  Edit,
  FileSpreadsheet,
  Calendar,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Settings,
  Pencil,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchRequests, updateRequestStatus } from "@/redux/slices/requests"
import { usePathname } from "next/navigation"
import { EditRequestDialog } from "./edit-request"
import { exportRequestsToExcel, exportRequestToExcel } from "@/lib/excel-export"
import SendMessageModal from "./send-email"
import { formatTimeAgo } from "@/lib/date-utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import EditProgressModal from "./edit-progress-modal"

// Define available fields for display
interface FieldConfig {
  id: string
  label: string
  defaultVisible: boolean
}

// Define sort types
type SortField = "createdAt" | "piUnlockTime" | "status" | "none"
type SortDirection = "asc" | "desc"

export default function AdminRequestsPage() {
  const availableFields: FieldConfig[] = [
    { id: "user", label: "User", defaultVisible: true },
    { id: "type", label: "Type", defaultVisible: true },
    { id: "createdAt", label: "Requested In", defaultVisible: true },
    { id: "progress", label: "Progress", defaultVisible: true },
    { id: "email", label: "Email", defaultVisible: true },
    { id: "status", label: "Status", defaultVisible: true },
    { id: "piUnlockTime", label: "Unlock Time", defaultVisible: true },
    { id: "note", label: "Note", defaultVisible: true },
    { id: "rejectReason", label: "Reject Reason", defaultVisible: false },
    { id: "rejectedBy", label: "Rejected By", defaultVisible: false },
  ]

  // Initialize visible fields from localStorage or defaults
  const initVisibleFields = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminRequestVisibleFields")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("Failed to parse saved field configuration")
        }
      }
    }
    return availableFields.filter((field) => field.defaultVisible).map((field) => field.id)
  }

  const [visibleFields, setVisibleFields] = useState<string[]>(initVisibleFields)

  // Save field selection to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("adminRequestVisibleFields", JSON.stringify(visibleFields))
    }
  }, [visibleFields])

  // Toggle field visibility
  const toggleField = (fieldId: string) => {
    setVisibleFields((prev) => {
      if (prev.includes(fieldId)) {
        // Don't allow removing all fields
        if (prev.length <= 1) return prev
        return prev.filter((id) => id !== fieldId)
      } else {
        return [...prev, fieldId]
      }
    })
  }

  // Reset to default fields
  const resetToDefaultFields = () => {
    setVisibleFields(availableFields.filter((field) => field.defaultVisible).map((field) => field.id))
  }
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
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
  const [isEditingProgress, setIsEditingProgress] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter, countryFilter, unlockTimeFilter, sortField, sortDirection])

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
  const handleEditProfress = (request: any) => {
    setSelectedRequest(request)
    setIsEditingProgress(true)   
  }
  const handleSendMessage = (request: any) => {
    setSelectedRequest(request)
    setMessageModalOpen(true)
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

  // Add a new state for the note modal
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState({ content: "", requestId: "", username: "" })

  // Add a function to handle viewing a note
  const handleViewNote = (note: string, requestId: string, username: string) => {
    setSelectedNote({
      content: note || "No note available",
      requestId,
      username,
    })
    setNoteModalOpen(true)
  }

  // Add a function to truncate note text
  const truncateNote = (note: string | undefined) => {
    if (!note) return "No note"

    // Split by newlines or approximate 2 lines (about 50 chars per line)
    const lines = note.split("\n")
    if (lines.length > 2) {
      return lines.slice(0, 2).join("\n") + "..."
    }

    if (note.length > 100) {
      return note.substring(0, 100) + "..."
    }

    return note
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)

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
       <div className="flex justify-between items-center"> {isRequest ? (
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
            <CardDescription>View and manage all recovery and protection requests</CardDescription>
          </CardHeader>
        ) : (
          <CardHeader></CardHeader>
        )}
         <div className="flex justify-end mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <Settings className="h-4 w-4 mr-2" />
                    Customize Columns
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Table Columns</h4>
                      <Button variant="ghost" size="sm" onClick={resetToDefaultFields}>
                        Reset to Default
                      </Button>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3">
                      {availableFields.map((field) => (
                        <div key={field.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`field-${field.id}`}
                            checked={visibleFields.includes(field.id)}
                            onCheckedChange={() => toggleField(field.id)}
                            disabled={visibleFields.length === 1 && visibleFields.includes(field.id)}
                          />
                          <Label
                            htmlFor={`field-${field.id}`}
                            className={
                              visibleFields.length === 1 && visibleFields.includes(field.id)
                                ? "text-muted-foreground"
                                : ""
                            }
                          >
                            {field.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
        </div>
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

            {/* Field Selection */}
           

            {/* Requests Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {visibleFields.includes("user") && <TableHead>User</TableHead>}
                    {visibleFields.includes("type") && <TableHead>Type</TableHead>}
                    {visibleFields.includes("note") && <TableHead>Note</TableHead>}
                    {visibleFields.includes("createdAt") && (
                      <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("createdAt")}>
                        <div className="flex items-center">Requested In {getSortIcon("createdAt")}</div>
                      </TableHead>
                    )}
                    {visibleFields.includes("email") && <TableHead>Email</TableHead>}
                    {visibleFields.includes("rejectReason") && <TableHead>Reject Reason</TableHead>}
                    {visibleFields.includes("rejectedBy") && <TableHead>Rejected By</TableHead>}
                    {visibleFields.includes("country") && <TableHead>Country</TableHead>}
                    {visibleFields.includes("amount") && <TableHead>Amount</TableHead>}
                    {visibleFields.includes("status") && (
                      <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("status")}>
                        <div className="flex items-center">Status {getSortIcon("status")}</div>
                      </TableHead>
                    )}
                    {visibleFields.includes("piUnlockTime") && (
                      <TableHead
                        className="cursor-pointer hover:text-primary"
                        onClick={() => handleSort("piUnlockTime")}
                      >
                        <div className="flex items-center">Unlock Time {getSortIcon("piUnlockTime")}</div>
                      </TableHead>
                    )}
                    <TableHead className="text-left">Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((request) => (
                      <TableRow key={request._id}>
                        {visibleFields.includes("user") && (
                          <TableCell className="font-medium">{request.user.username}</TableCell>
                        )}
                        {visibleFields.includes("type") && (
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
                        )}
                        {visibleFields.includes("note") && (
                          <TableCell>
                            <div className="flex items-start gap-2 max-w-xs">
                              <div className="line-clamp-2 text-sm">{truncateNote(request.note)}</div>
                              {request.note && request.note.length > 100 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewNote(request.note, request._id, request.user.username)
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span className="sr-only">View note</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {visibleFields.includes("createdAt") && (
                          <TableCell>{formatTimeAgo(request.createdAt)}</TableCell>
                        )}
                        {visibleFields.includes("email") && <TableCell>{request.email}</TableCell>}
                        {visibleFields.includes("rejectReason") && <TableCell>{request.rejectReason || "-"}</TableCell>}
                        {visibleFields.includes("rejectedBy") && (
                          <TableCell>{(request.rejectedBy && request.rejectedBy.username) || "-"}</TableCell>
                        )}
                        {visibleFields.includes("country") && <TableCell>{request.country || "-"}</TableCell>}
                        {/* {visibleFields.includes("amount") && (
                          //@ts-ignore
                          <TableCell>{request.amount ? `$${request.amount.toFixed(2)}` : "-"}</TableCell>
                        )} */}
                        {visibleFields.includes("status") && <TableCell>{getStatusBadge(request.status)}</TableCell>}
                        {visibleFields.includes("piUnlockTime") && (
                          <TableCell>
                            {request.requestType === "protection" && request.piUnlockTime
                              ? formatDate(request.piUnlockTime)
                              : "N/A"}
                          </TableCell>
                        )}
                        <TableCell>
                            {request.status !== "pending"
                              ? truncateNote(request.progress) || "-"
                              : "N/A"}
                              {request.progress && request.progress.length > 100 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewNote(request.progress, request._id, request.user.username)
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span className="sr-only">View Progress</span>
                                </Button>
                              )}
                          </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
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
                                <DropdownMenuItem onClick={() => handleEditProfress(request)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit Progress
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
                      <TableCell colSpan={visibleFields.length + 1} className="text-center py-4 text-muted-foreground">
                        No requests found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show pages around the current page
                        let pageNum
                        if (totalPages <= 5) {
                          // If 5 or fewer pages, show all
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          // If near the start, show first 5 pages
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          // If near the end, show last 5 pages
                          pageNum = totalPages - 4 + i
                        } else {
                          // Otherwise show 2 before and 2 after current page
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink onClick={() => setCurrentPage(pageNum)} isActive={currentPage === pageNum}>
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
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
          recipientName={selectedRequest.user.username}
          requestType={selectedRequest.requestType}
          requestId={selectedRequest._id}
        />
      )}
      {/* Note Modal */}
      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Note Details</DialogTitle>
            <DialogDescription>
              Request ID: {selectedNote.requestId} • User: {selectedNote.username}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <p className="whitespace-pre-wrap">{selectedNote.content}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {selectedRequest && (
        <EditProgressModal
          isOpen={isEditingProgress}
          onClose={() => setIsEditingProgress(false)}
          request={selectedRequest}
        />
      )}
    </div>
  )
}

