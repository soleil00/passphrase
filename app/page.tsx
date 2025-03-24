
import { ServiceSelection } from "@/components/service-selection"
import OurFeatures from "@/components/our-features"
import CustomerFeedback from "@/components/review"

export default function Dashboard() {
  return (
    <div className="space-y-6">

      <ServiceSelection/>
      <OurFeatures/>
      <CustomerFeedback/>
      <div className="flex justify-center items-center">
      <img src="/faq.png"/>
      </div>
    </div>
  )
}

