"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js"
import { formatDate } from "../utils/utils"
import { AdminStats } from "../types/admin"
import ReadersRanking from "@/app/components/ReadersRanking/ReadersRanking"
import ReadersStats from "@/app/components/ReadersStats/ReadersStats"
import ReadersAccessStatistics from "@/app/components/ReadersAccessStatistics/ReadersAccessStatistics"
import ReadersEngagement from "@/app/components/ReadersEngagement/ReadersEngagement"
import Loader from "@/app/components/Loader/Loader"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

interface CustomSession {
  user?: {
    id?: string
    email?: string | null
    name?: string | null
    isAdmin?: boolean
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession() as {
    data: CustomSession | null
    status: "loading" | "authenticated" | "unauthenticated"
  }
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
      return
    }

    if (status === "authenticated" && !session?.user?.isAdmin) {
      router.replace("/dashboard")
      return
    }

    fetchStats()
  }, [status, router, session])

  useEffect(() => {
    if (stats?.engagement) {
      const data = {
        labels: stats.engagement.map(
          (item) => formatDate(item.date).split(" ")[0],
        ),
        datasets: [
          {
            label: "Usuários",
            data: stats.engagement.map((item) => item.users),
            borderColor: "#FFF3C9",
            backgroundColor: "#FFF3C9",
            yAxisID: "y",
          },
          {
            label: "Acessos",
            data: stats.engagement.map((item) => item.accesses),
            borderColor: "#CBA600",
            backgroundColor: "#CBA600",
            yAxisID: "y1",
          },
        ],
      }
      setChartData(data)
    }
  }, [stats])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return <Loader className='min-h-screen' />
  }

  if (!session?.user?.isAdmin) {
    return null
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='flex flex-col items-start mb-8'>
            <div className='flex items-center justify-between w-full'>
              <div>
                <h1 className='text-3xl font-bold font-montserrat text-secondary'>
                  Dashboard Administrativo
                </h1>
                <p className='text-sm font-poppins text-secondary_muted mt-2'>
                  Monitore o engajamento dos leitores do the news
                </p>
              </div>
            </div>
          </div>

          <ReadersStats overview={stats?.overview} />

          <ReadersAccessStatistics stats={stats} />

          <ReadersRanking users={stats?.topUsers} />

          <ReadersEngagement chartData={chartData} />
        </div>
      </div>
    </div>
  )
}
