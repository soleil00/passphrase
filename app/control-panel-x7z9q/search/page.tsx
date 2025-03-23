"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchRequests } from "@/redux/slices/requests"

interface BalanceData {
  currentBalance: string
  lockedBalance: string
  lockDate: string
  isLoading: boolean
  error: string | null
  hasSearched: boolean
}

export default function Home() {
  const [publicKey, setPublicKey] = useState("")
  const [balanceData, setBalanceData] = useState<BalanceData>({
    currentBalance: "0.00",
    lockedBalance: "0.00",
    lockDate: "",
    isLoading: false,
    error: null,
    hasSearched: false,
  })
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const dispatch = useAppDispatch()
  const { requests, loading: isLoadingRequests } = useAppSelector((state) => state.requests)

  // Filter requests for recovery type
  const filteredRequests = requests.filter((req) => req.requestType === "recovery")

  // Fetch requests on component mount
  useEffect(() => {
    dispatch(fetchRequests())
  }, [dispatch])

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchBalanceData = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey.trim()) {
      setBalanceData({
        ...balanceData,
        error: "Please enter a valid Pi wallet address",
        hasSearched: false,
      })
      return
    }

    setBalanceData({
      ...balanceData,
      isLoading: true,
      error: null,
      hasSearched: false,
    })

    try {
      // Fetch claimable balances
      const res1 = await axios.get(`https://api.mainnet.minepi.com/claimable_balances/?claimant=${publicKey}`)

      // Fetch account details
      const res2 = await axios.get(`https://api.mainnet.minepi.com/accounts/${publicKey}`)

      // Extract data from responses
      let currentBalance = "0.00"
      let lockedBalance = "0.00"
      let lockDate = ""

      if (res2.data && res2.data.balances && res2.data.balances.length > 0) {
        currentBalance = res2.data.balances[0].balance
      }

      if (res1.data && res1.data._embedded && res1.data._embedded.records && res1.data._embedded.records.length > 0) {
        lockedBalance = res1.data._embedded.records[0].amount

        if (
          res1.data._embedded.records[0].claimants &&
          res1.data._embedded.records[0].claimants.length > 1 &&
          res1.data._embedded.records[0].claimants[1].predicate &&
          res1.data._embedded.records[0].claimants[1].predicate.not
        ) {
          lockDate = res1.data._embedded.records[0].claimants[1].predicate.not.abs_before
        }
      }

      setBalanceData({
        currentBalance,
        lockedBalance,
        lockDate,
        isLoading: false,
        error: null,
        hasSearched: true,
      })

      setShowDropdown(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setBalanceData({
        ...balanceData,
        isLoading: false,
        error: "Failed to fetch balance data. Please check the wallet address and try again.",
        hasSearched: false,
      })
    }
  }

  const handleInputFocus = () => {
    setShowDropdown(true)
  }

  const handleRequestSelect = (request: any) => {
    setPublicKey(request.publicKey)
    setShowDropdown(false)

    const event = { preventDefault: () => {} } as React.FormEvent
    fetchBalanceData(event)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString()
  }

  const truncatePublicKey = (key: string) => {
    if (!key) return ""
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Pi Network Balance Viewer</h1>
        <p className="text-gray-600">View detailed information about your balance and locked Pi on Pi Network</p>
      </div>

      <form onSubmit={fetchBalanceData} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter your Pi wallet address"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            onFocus={handleInputFocus}
            className="w-full pl-4 pr-10 py-2 rounded-lg"
          />

          {/* Dropdown for recovery requests */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {isLoadingRequests ? (
                <div className="p-3 text-center text-gray-500">Loading requests...</div>
              ) : filteredRequests.length > 0 ? (
                <ul>
                  {filteredRequests.map((request, index) => (
                    <li
                      key={index}
                      onClick={() => handleRequestSelect(request)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{truncatePublicKey(request.publicKey)}</div>
                      <div className="text-sm text-gray-500">Username: {request.user.username}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-center text-gray-500">No recovery requests found</div>
              )}
            </div>
          )}
        </div>
        <Button type="submit" disabled={balanceData.isLoading} className="bg-blue-600 hover:bg-blue-700">
          {balanceData.isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      {balanceData.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{balanceData.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600 text-lg font-normal flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-5xl font-bold mb-1">{balanceData.currentBalance} PI</h3>
            <p className="text-gray-500">Available Pi in wallet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600 text-lg font-normal flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Total Balance Locked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-5xl font-bold mb-1">{balanceData.lockedBalance} PI</h3>
            <p className="text-gray-500">Total Pi in lockup period</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-600 text-lg font-normal flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              List of Locked Balances
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Update Time</TableHead>
                  <TableHead>Unlock Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balanceData.hasSearched && balanceData.lockedBalance !== "0.00" ? (
                  <TableRow>
                    <TableCell>{balanceData.lockedBalance}</TableCell>
                    <TableCell>PI</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{formatDate(balanceData.lockDate)}</TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      {balanceData.isLoading
                        ? "Loading..."
                        : balanceData.hasSearched
                          ? "No locked balances found"
                          : "Enter a wallet address to view locked balances"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

