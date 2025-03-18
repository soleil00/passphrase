
import { ServiceSelection } from '@/components/service-selection'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const ServicePage = () => {

  return (
    <div>
      <Link href="/" passHref>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back Home
        </Button>
      </Link>
      <ServiceSelection/>
    </div>
  )
}

export default ServicePage