"use client"

import { useEffect } from "react"
import { AlertTriangle, FileSpreadsheet, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchRequests } from "@/redux/slices/requests"
import { exportRequestsToExcel } from "@/lib/excel-export"
import { useState } from "react"
import { formatTimeAgo } from "@/lib/date-utils"

export default function AdminRejectedRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isExporting, setIsExporting] = useState(false)

  const {currentUser} = useAppSelector(state =>state.auth)

  const { requests } = useAppSelector((state) => state.requests)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchRequests())
  }, [dispatch])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  const handleExportRejectedRequests = async () => {
    try {
      setIsExporting(true)
      const dataToExport =
        rejectedRequests.length > 0 ? (searchTerm || typeFilter !== "all" ? filteredRequests : rejectedRequests) : []

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

  // Filter only rejected requests
  const rejectedRequests = requests.filter((request) => request.status === "failed")

  // Apply additional filters
  const filteredRequests = rejectedRequests.filter((request) => {
    const matchesSearch =
      request._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.rejectedBy?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.rejectReason || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || request.requestType === typeFilter

    return matchesSearch && matchesType
  })

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rejected Requests</h1>

        <Button
          onClick={handleExportRejectedRequests}
          disabled={isExporting || rejectedRequests.length === 0}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isExporting
            ? "Exporting..."
            : `Export ${filteredRequests.length !== rejectedRequests.length ? "Filtered" : "All"} (${filteredRequests.length})`}
        </Button>
      </div>

      <Card className="my-6">
        <CardHeader>
          <CardTitle>Rejected Requests Summary</CardTitle>
          <CardDescription>View all rejected requests and their reasons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username, reason, rejected by..."
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
              </div>
            </div>

            {/* Rejected Requests Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Type</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rejected By</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                    <TableHead>Rejected</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.reverse().map((request) => (
                      <TableRow key={request._id}>
                        <TableCell className="font-medium capitalize">{request.requestType}</TableCell>
                        <TableCell>{request.user?.username || "N/A"}</TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>{request.rejectedBy?.username || "System"}</TableCell>
                        <TableCell>{formatCurrency(request.piBalance || 0)} π</TableCell>
                        <TableCell className="max-w-xs truncate" title={request.rejectReason}>
                          {request.rejectReason || "No reason provided"}
                        </TableCell>
                        <TableCell>{formatTimeAgo(request.updatedAt)}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            <AlertTriangle className="mr-1 h-3 w-3" /> Rejected
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                        No rejected requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

