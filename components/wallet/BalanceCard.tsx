import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
  className?: string;
  delay?: number;
  date?:string
}

const BalanceCard = ({
  icon,
  title,
  value,
  description,
  className,
  delay = 0,
  date
}: BalanceCardProps) => {
  return (
    <div
      className={cn(
        'flex flex-col bg-white shadow-md rounded-lg p-6 border border-gray-200 animate-fade-in',
        className
      )}
      style={{ '--delay': delay } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 text-gray-700">
        {icon}
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
      { !date  && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      {
        date && <p className="text-gray-500 text-sm mt-1">Locked until {date}</p>
      }
    </div>
  );
};

export default BalanceCard;
