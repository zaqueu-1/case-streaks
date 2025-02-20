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
import { Line } from "react-chartjs-2"
import { formatDate } from "../utils/utils"
import { AdminStats } from "../types/admin"
import UTMStats from "@/app/components/UTMStats/UTMStats"
import ReadersRanking from "@/app/components/ReadersRanking/ReadersRanking"
import ReadersStats from "@/app/components/ReadersStats/ReadersStats"
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

const chartOptions = {
  responsive: true,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Data",
      },
    },
    y: {
      type: "linear" as const,
      display: true,
      position: "left" as const,
      title: {
        display: true,
        text: "Usuários",
      },
    },
    y1: {
      type: "linear" as const,
      display: true,
      position: "right" as const,
      title: {
        display: true,
        text: "Acessos",
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  },
}

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
  const [period, setPeriod] = useState("7")
  const [streakStatus, setStreakStatus] = useState("all")
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
            borderColor: "#FFCF00",
            backgroundColor: "#FFCF00",
            yAxisID: "y",
          },
          {
            label: "Acessos",
            data: stats.engagement.map((item) => item.accesses),
            borderColor: "#FFDF53",
            backgroundColor: "#FFDF53",
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

          <div className='bg-primary_muted p-4 rounded-lg shadow-lg mb-8'>
            <h2 className='text-lg font-bold font-montserrat text-secondary mb-4'>
              Filtros
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='flex flex-col'>
                <label className='text-sm font-medium text-secondary_muted mb-2'>
                  Período
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className='border-2 border-primary_muted rounded-md p-2 text-secondary'
                >
                  <option value='7'>Últimos 7 dias</option>
                  <option value='30'>Últimos 30 dias</option>
                  <option value='90'>Últimos 90 dias</option>
                </select>
              </div>
              <div className='flex flex-col'>
                <label className='text-sm font-medium text-secondary_muted mb-2'>
                  Status do Streak
                </label>
                <select
                  value={streakStatus}
                  onChange={(e) => setStreakStatus(e.target.value)}
                  className='border-2 border-primary_muted rounded-md p-2 text-secondary'
                >
                  <option value='all'>Todos</option>
                  <option value='active'>Streak Ativo</option>
                  <option value='broken'>Streak Quebrado</option>
                </select>
              </div>
            </div>
          </div>

          <ReadersStats overview={stats?.overview} />

          <div className='bg-primary_muted p-6 rounded-lg shadow-lg mb-8'>
            <h2 className='text-lg font-bold font-montserrat text-secondary mb-4'>
              Engajamento ao Longo do Tempo
            </h2>
            <div className='h-64'>
              {chartData.datasets.length > 0 && (
                <Line options={chartOptions} data={chartData} />
              )}
            </div>
          </div>

          <ReadersRanking users={stats?.topUsers} />

          <div className='bg-primary_muted p-6 rounded-lg shadow-lg mb-8'>
            <h2 className='text-lg font-bold font-montserrat text-secondary mb-4'>
              Estatísticas de acessos
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <UTMStats title='Fonte' data={stats?.utmStats?.sources} />

              <UTMStats title='Meio' data={stats?.utmStats?.mediums} />

              <UTMStats title='Campanha' data={stats?.utmStats?.campaigns} />

              <UTMStats title='Canal' data={stats?.utmStats?.channels} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
