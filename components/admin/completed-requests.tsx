"use client"

import { useEffect } from "react"
import { CheckCircle, FileSpreadsheet, Search, Filter } from "lucide-react"
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

export default function AdminCompletedRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isExporting, setIsExporting] = useState(false)

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  const handleExportCompletedRequests = async () => {
    try {
      setIsExporting(true)
      const dataToExport =
        completedRequests.length > 0 ? (searchTerm || typeFilter !== "all" ? filteredRequests : completedRequests) : []

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

  // Filter only completed requests
  const completedRequests = requests.filter((request) => request.status === "completed")

  // Apply additional filters
  const filteredRequests = completedRequests.filter((request) => {
    const matchesSearch =
      request._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.completedBy?.username || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || request.requestType === typeFilter

    return matchesSearch && matchesType
  })

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Completed Requests</h1>

        <Button
          onClick={handleExportCompletedRequests}
          disabled={isExporting || completedRequests.length === 0}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isExporting
            ? "Exporting..."
            : `Export ${filteredRequests.length !== completedRequests.length ? "Filtered" : "All"} (${filteredRequests.length})`}
        </Button>
      </div>

      <Card className="my-6">
        <CardHeader>
          <CardTitle>Completed Requests Summary</CardTitle>
          <CardDescription>View all successfully completed requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username, completed by..."
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

            {/* Completed Requests Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Type</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Completed By</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Completed Date</TableHead>
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
                        <TableCell>{request.completedBy?.username || "System"}</TableCell>
                        <TableCell>{formatCurrency(request.piBalance || 0)} π</TableCell>
                        <TableCell>{formatTimeAgo(request.updatedAt)}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" /> Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No completed requests found
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

