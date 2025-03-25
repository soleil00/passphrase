"use client"

import { useEffect, useState } from "react"
import { Search, ChevronDown, Construction, Calendar, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { getAllUsers } from "@/redux/slices/auth"
import { formatTimeAgo } from "@/lib/date-utils"

// Define sort types
type SortDirection = "asc" | "desc"

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [dateFilter, setDateFilter] = useState("all")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const { users } = useAppSelector((state) => state.auth)

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(getAllUsers())
  }, [dispatch])

  // Function to check if a date is within a specific range from now
  const isDateInRange = (date: Date, days: number): boolean => {
    const now = new Date()
    const pastDate = new Date(now)
    pastDate.setDate(pastDate.getDate() - days)

    return date >= pastDate && date <= now
  }

  // Apply filters and sorting
  const filteredAndSortedUsers = users
    .filter((user) => {
      // Search filter
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase())

      // Date filter
      let matchesDateFilter = true
      if (dateFilter !== "all") {
        const createdAtDate = new Date(user.createdAt)

        switch (dateFilter) {
          case "today":
            matchesDateFilter = isDateInRange(createdAtDate, 1)
            break
          case "week":
            matchesDateFilter = isDateInRange(createdAtDate, 7)
            break
          case "15days":
            matchesDateFilter = isDateInRange(createdAtDate, 15)
            break
          case "month":
            matchesDateFilter = isDateInRange(createdAtDate, 30)
            break
          default:
            matchesDateFilter = true
        }
      }

      return matchesSearch && matchesDateFilter
    })
    .sort((a, b) => {
      // Sort by createdAt
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()

      return sortDirection === "asc"
        ? dateA - dateB // Ascending: oldest first
        : dateB - dateA // Descending: newest first
    })

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredAndSortedUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  // Get sort icon based on current sort state
  const getSortIcon = () => {
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
  }

  const formatDate = (dateString: Date) => {
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

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage all users of the Pi Recovery Service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select
                  value={dateFilter}
                  onValueChange={(value) => {
                    setDateFilter(value)
                    setCurrentPage(1) // Reset to first page when filter changes
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Registration Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Registered Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="15days">Last 15 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={toggleSortDirection}>
                      <div className="flex items-center">Registered At {getSortIcon()}</div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <TableRow key={user.username}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={user.username} />
                              <AvatarFallback>
                                {user.username
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{user.username}</div>
                          </div>
                        </TableCell>
                        <TableCell>{user.count}</TableCell>
                        <TableCell>{formatTimeAgo(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {/* <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${user.username}`}>
                                    <User className="h-4 w-4 mr-2" />
                                    View Profile
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${user.username}/requests`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Requests
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Contact User
                                </DropdownMenuItem> */}
                                <DropdownMenuItem>
                                  <Construction className="h-4 w-4 mr-2" />
                                  Under development
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No users found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

