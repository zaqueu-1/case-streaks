import { redirect } from "next/navigation"

export default async function Home({ searchParams }) {
  if (searchParams?.email && searchParams?.id) {
    const url = `/api/webhook?${new URLSearchParams(searchParams).toString()}`
    redirect(url)
  }

  redirect("/dashboard")
}
