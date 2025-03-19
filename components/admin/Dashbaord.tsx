"use client"

import {
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { StatCard } from "./stat-card"
import AdminRequestsPage from "./admin-requests"
import { useAppSelector } from "@/redux/hooks"


export default function AdminDashboard() {
 const {requests} = useAppSelector(state => state.requests)
 const {users} = useAppSelector(state => state.auth)



  const data =[
    {
      title:"Pending Requests",
      count:requests.filter(r=>r.status==="pending").length
    },
    {
      title:"Processing Requests",
      count:requests.filter(r=>r.status==="processing").length
    },
    {
      title:"Completed Requests",
      count:requests.filter(r=>r.status==="completed").length
    },
    {
      title:"Failed Requests",
      count:requests.filter(r=>r.status==="failed").length
    },
    {
      title:"Users",
      count:users.length
    },
  ]

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {
          data.map((item,i)=> <StatCard {...item} key={i} />)
        }
      </div>
      <AdminRequestsPage/>
    </div>
  )
}

