"use client"

import { AuthenticationPrompt } from '@/components/authentication-prompt'
import { ServiceHistory } from '@/components/requests-history'
import { useAppSelector } from '@/redux/hooks'
import React from 'react'

const MyRequests = () => {
  const {currentUser} = useAppSelector(state => state.auth)
  return (
    <div>
      {
        currentUser ? <ServiceHistory /> : (
          <AuthenticationPrompt/>
        )
      }
    </div>
  )
}

export default MyRequests