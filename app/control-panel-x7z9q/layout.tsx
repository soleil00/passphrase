"use client"
import type React from "react"
import type { Metadata } from "next"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { getAllUsers, getUserInfo } from "@/redux/slices/auth"
import { useRouter } from "next/navigation"

// export const metadata: Metadata = {
//   title: "Admin Dashboard",
//   description: "Secure admin dashboard",
//   robots: {
//     index: false,
//     follow: false,
//   },
// }

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const { currentUser } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  const router = useRouter()

  // useEffect(() => {
  //   const token = localStorage.getItem("token")
  //   if (!currentUser) {
  //     router.push('/x7z9q/login') 
  //   } 

  // }, [currentUser])
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      dispatch(getUserInfo())
      dispatch(getAllUsers())
    } else {
      router.push('/x7z9q/login') 
    }
  }, [dispatch, currentUser, router])

  return (
    <div>{children}</div>
  )
}
