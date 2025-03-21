import { Wallet, Lock, Loader } from 'lucide-react';
import LockedBalanceTable from './LockedBalanceTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React, { SetStateAction, useEffect, useState } from 'react';
import BalanceCard from './BalanceCard';
import axios from 'axios';
import { Button } from '../ui/button';

interface FinanceDashboardProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setStep: React.Dispatch<SetStateAction<number>>;
  wallet: string;
  balance:number,
  lockedBalance:number,
  lockDate:string
}

const FinanceDashboard = ({ open, setOpen, setStep, wallet ,balance,lockedBalance,lockDate}: FinanceDashboardProps) => {
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState('0.00 PI');
  const [totalLocked, setTotalLocked] = useState('0.00 PI');



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-7xl w-[95%] rounded-md mx-auto p-6 space-y-6">
        <DialogHeader>
          <DialogTitle>Wallet Deatils</DialogTitle>
        </DialogHeader>

        {/* <div>{wallet}</div> */}

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
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button  onClick={() => {
            setOpen(false)
            setStep(2)
          }}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinanceDashboard;
