import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card' // Adjust the import path as necessary

interface StatCardProps {
  title: string;
  count: number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, count }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{count}</div>
        <p className="text-sm text-muted-foreground">Total {title.toLowerCase()}</p>
      </CardContent>
    </Card>
  )
}
