"use client"

import { useEffect, useState } from "react"
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Edit,
  DollarSign,
  Save,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { formatTimeAgo } from "@/lib/date-utils"
import { fetchEarnings, IEarning, updateEarningNotes, updateEarningPaymentStatus } from "@/redux/slices/earning"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import AdminEarningsOverview from "./earning-max"

type SortField = "amount" | "createdAt" | "updatedAt" | "none"
type SortDirection = "asc" | "desc"
type PaymentStatus = "all" | "paid" | "unpaid"


export default function AdminEarningsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedHandler, setSelectedHandler] = useState("all")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isExporting, setIsExporting] = useState(false)
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [selectedEarning, setSelectedEarning] = useState<IEarning | null>(null)
  const [noteText, setNoteText] = useState("")
  const [isUpdatingNote, setIsUpdatingNote] = useState(false)
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)

  const {currentUser} = useAppSelector((state) => state.auth)

  const { earnings, loading, updating } = useAppSelector(
    (state) => state.earnings || { earnings: [], loading: false, updating: false },
  )
  const { users } = useAppSelector((state) => state.auth || { users: [] })
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchEarnings())
  }, [dispatch])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground" />
    }
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
  }

  const handleDateRangeSelect = (date: Date | undefined) => {
    if (!startDate) {
      setStartDate(date)
    } else if (!endDate && date && date > startDate) {
      setEndDate(date)
    } else {
      setStartDate(date)
      setEndDate(undefined)
    }
  }

  const clearDateRange = () => {
    setStartDate(undefined)
    setEndDate(undefined)
  }

  const handleExportEarnings = () => {
    try {
      setIsExporting(true)
      // Implement export functionality here
      setTimeout(() => {
        setIsExporting(false)
      }, 1000)
    } catch (error) {
      console.error("Export failed:", error)
      setIsExporting(false)
    }
  }

  const openNotesModal = (earning: IEarning) => {
    setSelectedEarning(earning)
    setNoteText(earning.note || "")
    setNotesModalOpen(true)
  }

  const closeNotesModal = () => {
    setNotesModalOpen(false)
    setSelectedEarning(null)
    setNoteText("")
  }

  const saveNotes = async () => {
    if (!selectedEarning) return
    try {
      setIsUpdatingNote(true)
      await dispatch(
        updateEarningNotes({
          earningId: selectedEarning._id,
          note: noteText,
        }),
      ).unwrap()
      closeNotesModal()
    } catch (error) {
      console.error("Failed to update notes:", error)
    } finally {
      setIsUpdatingNote(false)
    }
  }

  const togglePaymentStatus = async (earning: IEarning) => {
    try {
      setIsUpdatingPayment(true)
      await dispatch(
        updateEarningPaymentStatus(earning._id),
      ).unwrap()
    } catch (error) {
      console.error("Failed to update payment status:", error)
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  const filteredEarnings = earnings.filter((earning) => {
    const matchesSearch =
      earning.handler.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (earning.note || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      earning.request._id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPaymentStatus =
      paymentStatus === "all" ||
      (paymentStatus === "paid" && earning.isPaid) ||
      (paymentStatus === "unpaid" && !earning.isPaid)

    const matchesHandler = selectedHandler === "all" || earning.handler._id === selectedHandler

    let matchesDateRange = true
    if (startDate) {
      const earningDate = new Date(earning.createdAt)
      matchesDateRange = earningDate >= startDate
      if (endDate) {
        const adjustedEndDate = new Date(endDate)
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1)
        matchesDateRange = matchesDateRange && earningDate < adjustedEndDate
      }
    }

    return matchesSearch && matchesPaymentStatus && matchesHandler && matchesDateRange
  })

  const sortedEarnings = [...filteredEarnings].sort((a, b) => {
    if (sortField === "none") return 0
    if (sortField === "amount") {
      return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount
    }
    if (sortField === "createdAt") {
      return sortDirection === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    if (sortField === "updatedAt") {
      return sortDirection === "asc"
        ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
    return 0
  })

  const paginatedEarnings = sortedEarnings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(sortedEarnings.length / itemsPerPage)

  const totalEarnings = filteredEarnings.reduce((sum, earning) => sum + earning.amount, 0)
  const totalPaidEarnings = filteredEarnings
    .filter((earning) => earning.isPaid)
    .reduce((sum, earning) => sum + earning.amount, 0)
  const totalUnpaidEarnings = filteredEarnings
    .filter((earning) => !earning.isPaid)
    .reduce((sum, earning) => sum + earning.amount, 0)

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Earnings Tracker</h1>
        <Button
          onClick={handleExportEarnings}
          disabled={isExporting || filteredEarnings.length === 0}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isExporting ? "Exporting..." : `Export Earnings (${filteredEarnings.length})`}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">π{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">{filteredEarnings.length} earnings records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Paid Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">π{formatCurrency(totalPaidEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredEarnings.filter((e) => e.isPaid).length} paid records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Unpaid Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">π{formatCurrency(totalUnpaidEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredEarnings.filter((e) => !e.isPaid).length} unpaid records
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="my-6">
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
          <CardDescription>Track and manage all earnings on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by handler, notes, request ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}>
                  <SelectTrigger className="w-[140px]">
                    <span>Payment</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="paid">Paid Only</SelectItem>
                    <SelectItem value="unpaid">Unpaid Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedHandler} onValueChange={setSelectedHandler}>
                  <SelectTrigger className="w-[140px]">
                    <User className="h-4 w-4 mr-2" />
                    <span>Handler</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Handlers</SelectItem>
                    {users.map((user: any) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      {startDate ? (
                        endDate ? (
                          <span>
                            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                          </span>
                        ) : (
                          <span>From {startDate.toLocaleDateString()}</span>
                        )
                      ) : (
                        <span>Date Range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Select Date Range</h3>
                        {(startDate || endDate) && (
                          <Button variant="ghost" size="sm" onClick={clearDateRange}>
                            Clear
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {startDate && !endDate ? "Select end date" : "Select start date"}
                      </p>
                    </div>
                    <CalendarComponent
                      mode="single"
                      selected={endDate || startDate}
                      onSelect={handleDateRangeSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Handler</TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("amount")}>
                      <div className="flex items-center">Amount {getSortIcon("amount")}</div>
                    </TableHead>
                    <TableHead>Request Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("createdAt")}>
                      <div className="flex items-center">Created {getSortIcon("createdAt")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("updatedAt")}>
                      <div className="flex items-center">Updated {getSortIcon("updatedAt")}</div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">Loading earnings data...</p>
                      </TableCell>
                    </TableRow>
                  ) : paginatedEarnings.length > 0 ? (
                    paginatedEarnings.map((earning) => (
                      <TableRow key={earning._id}>
                        <TableCell className="font-medium">{earning.handler.username}</TableCell>
                        <TableCell className="font-bold">π{formatCurrency(earning.amount)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="capitalize">{earning.request.requestType} Request</span>
                            <span className="text-xs text-muted-foreground">User: {earning.request.user.username}</span>
                            <span className="text-xs text-muted-foreground">
                              ID: {earning.request._id.substring(0, 8)}...
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {earning.isPaid ? (
                            <Badge className="bg-green-500 flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" /> Paid
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 flex items-center gap-1 w-fit">
                              <XCircle className="h-3 w-3" /> Unpaid
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={earning.note || ""}>
                          {earning.note || "-"}
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{formatTimeAgo(earning.createdAt)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{formatTimeAgo(earning.updatedAt)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* {currentUser?.username} */}
                            {/* {
                              currentUser?.username.toLowerCase() === earning.handler.username.toLowerCase() || currentUser?.isSuperAdmin && ( */}
                                <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openNotesModal(earning)}
                                    disabled={updating}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only md:not-sr-only md:ml-2 md:inline-block">Notes</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Add or edit notes</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                              {/* )
                            } */}

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={earning.isPaid ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => togglePaymentStatus(earning)}
                                    disabled={isUpdatingPayment || updating}
                                  >
                                    <DollarSign className="h-4 w-4" />
                                    <span className="sr-only md:not-sr-only md:ml-2 md:inline-block">
                                      {earning.isPaid ? "Unpaid" : "Mark Paid"}
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{earning.isPaid ? "Mark as unpaid" : "Mark as paid"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                        No earnings found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredEarnings.length)} of {filteredEarnings.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous Page</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="mx-1">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next Page</span>
                  </Button>

                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number.parseInt(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={notesModalOpen} onOpenChange={setNotesModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Notes</DialogTitle>
            <DialogDescription>Add or update notes for this earning record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter notes about this earning..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={closeNotesModal} disabled={isUpdatingNote}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={saveNotes} disabled={isUpdatingNote}>
              {isUpdatingNote ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminEarningsOverview/>
    </div>
  )
}
