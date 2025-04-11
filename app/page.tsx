import { redirect } from "next/navigation"

export const metadata = {
  title: 'Case Streaks',
  description: 'Acompanhe suas streaks e métricas de acesso'
}

export default function Home() {
  redirect("/dashboard")
} 