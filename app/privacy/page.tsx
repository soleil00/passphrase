import { redirect } from "next/navigation"

export default function PrivacyPage() {
  redirect("/terms?tab=privacy")
  return null
}

