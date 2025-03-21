import { useState } from 'react';
import { ArrowUpRight, Copy, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LockedBalance {
  id: string;
  quantity: string;
  asset: string;
  updateTime: string;
  updateDate: string;
  unlockTime: string;
  unlockDate: string;
}

interface LockedBalanceTableProps {
  balances: LockedBalance[];
  className?: string;
  delay?: number;
}

const LockedBalanceTable = ({
  balances,
  className,
  delay = 2
}: LockedBalanceTableProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const truncateId = (id: string) => {
    return `:${id.slice(0, 8)}...${id.slice(-4)}`;
  };

  return (
    <div 
      className={cn('finance-card animate-fade-in', className)}
      style={{ '--delay': delay } as React.CSSProperties}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="finance-heading">
          <Lock size={18} className="finance-icon" />
          List of Locked Balances
        </h3>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowUpRight size={18} className="finance-icon" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="finance-table">
          <thead>
            <tr>
              <th className="text-left">ID</th>
              <th className="text-right">Quantity</th>
              <th className="text-center">Asset</th>
              <th className="text-center">Update Time</th>
              <th className="text-center">Unlock Time</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((balance, index) => (
              <tr key={balance.id} className="hover:bg-gray-50 transition-colors">
                <td className="flex items-center gap-2 font-mono">
                  {truncateId(balance.id)}
                  <button 
                    onClick={() => copyToClipboard(balance.id)}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                    title="Copy ID"
                  >
                    <Copy size={14} className={copiedId === balance.id ? "text-green-500" : "text-gray-400"} />
                  </button>
                </td>
                <td className="text-right font-medium">{balance.quantity}</td>
                <td className="text-center">{balance.asset}</td>
                <td className="text-center">
                  <div>{balance.updateTime}</div>
                  <div className="text-xs text-finance-text-light">{balance.updateDate}</div>
                </td>
                <td className="text-center">
                  <div>{balance.unlockTime}</div>
                  <div className="text-xs text-finance-text-light">{balance.unlockDate}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LockedBalanceTable;
