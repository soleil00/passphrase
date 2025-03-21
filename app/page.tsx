
import { ServiceSelection } from "@/components/service-selection"
import OurFeatures from "@/components/our-features"

export default function Dashboard() {
  return (
    <div className="space-y-6">

      <ServiceSelection/>
      <OurFeatures/>
      <div className="flex justify-center items-center">
      <img src="/faq.png"/>
      </div>
    </div>
  )
}

