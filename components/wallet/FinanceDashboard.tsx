"use client"

import { Wallet, Lock, Loader, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type React from "react"
import { type SetStateAction, useState } from "react"
import BalanceCard from "./BalanceCard"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FinanceDashboardProps {
  open: boolean
  setOpen: (open: boolean) => void
  setStep: React.Dispatch<SetStateAction<number>>
  wallet: string
  balance: number
  lockedBalance: number
  lockDate: string
}

const FinanceDashboard = ({
  open,
  setOpen,
  setStep,
  wallet,
  balance,
  lockedBalance,
  lockDate,
}: FinanceDashboardProps) => {
  const [loading, setLoading] = useState(false)

  // Check if locked balance meets the minimum requirement
  const hasMinimumBalance = (Number(lockedBalance) + Number(balance)) >= 10

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-7xl w-[95%] rounded-md mx-auto p-6 space-y-6">
        <DialogHeader>
          <DialogTitle>Wallet Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BalanceCard
              icon={<Wallet size={18} className="finance-icon" />}
              title="Current Balance"
              value={`${balance}`}
              description="Available Pi in wallet"
              delay={0}
            />

            <BalanceCard
              icon={<Lock size={18} className="finance-icon" />}
              title="Total Balance Locked"
              value={`${lockedBalance}`}
              description="Total Pi in lockup period"
              delay={1}
              date={`${lockDate}`}
            />
          </div>
        )}

        {/* Conditional alert message when balance is insufficient */}
        {!hasMinimumBalance && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Requests can only be processed for locked balances above 10Pi. Your current locked balance is insufficient.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {hasMinimumBalance ? "Cancel" : "Close"}
          </Button>

          {/* Conditional rendering of the Confirm/Continue button */}
          {hasMinimumBalance ? (
            <Button
              onClick={() => {
                setOpen(false)
                setStep(2)
              }}
            >
              Confirm
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FinanceDashboard

