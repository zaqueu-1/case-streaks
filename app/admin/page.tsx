"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
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
import { AdminStats, UpdateResult } from "../types/admin"

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
  const [updating, setUpdating] = useState(false)
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [period, setPeriod] = useState("7")
  const [streakStatus, setStreakStatus] = useState("all")
  const [newsletter, setNewsletter] = useState("all")
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

  const handleUpdatePoints = async () => {
    try {
      setUpdating(true)
      const response = await fetch("/api/update-points")
      const result = await response.json()
      setUpdateResult(result)
      fetchStats()
    } catch (error) {
      console.error("Erro ao atualizar pontos:", error)
      setUpdateResult({ error: "Erro ao atualizar pontos" })
    } finally {
      setUpdating(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-secondary_muted'>Carregando...</p>
        </div>
      </div>
    )
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
              <button
                onClick={handleUpdatePoints}
                disabled={updating}
                className='px-4 py-2 bg-primary text-secondary rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {updating ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-secondary inline'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Atualizando...
                  </>
                ) : (
                  "Atualizar Pontos e Níveis"
                )}
              </button>
            </div>
            {updateResult && (
              <div
                className={`mt-4 p-4 rounded-lg w-full ${
                  updateResult.error
                    ? "bg-red-50 text-red-800"
                    : "bg-green-50 text-green-800"
                }`}
              >
                {updateResult.error ? (
                  updateResult.error
                ) : (
                  <>
                    {updateResult.message}
                    <br />
                    {updateResult.totalUpdated} usuários atualizados
                  </>
                )}
              </div>
            )}
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
              <div className='flex flex-col'>
                <label className='text-sm font-medium text-secondary_muted mb-2'>
                  Newsletter
                </label>
                <select
                  value={newsletter}
                  onChange={(e) => setNewsletter(e.target.value)}
                  className='border-2 border-primary_muted rounded-md p-2 text-secondary'
                >
                  <option value='all'>Todas</option>
                  <option value='daily'>Daily</option>
                  <option value='weekly'>Weekly</option>
                </select>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
            <div className='bg-primary_muted p-6 rounded-lg shadow-lg'>
              <h3 className='text-sm font-medium text-secondary_muted'>
                Total de Leitores
              </h3>
              <p className='text-3xl font-bold text-secondary mt-2'>
                {stats?.overview.total_users || 0}
              </p>
            </div>
            <div className='bg-primary_muted p-6 rounded-lg shadow-lg'>
              <h3 className='text-sm font-medium text-secondary_muted'>
                Média de Streak
              </h3>
              <p className='text-3xl font-bold text-secondary mt-2'>
                {stats?.overview.avg_streak.toFixed(1) || "0.0"}
              </p>
            </div>
            <div className='bg-primary_muted p-6 rounded-lg shadow-lg'>
              <h3 className='text-sm font-medium text-secondary_muted'>
                Leitores Ativos
              </h3>
              <p className='text-3xl font-bold text-secondary mt-2'>
                {stats?.overview.active_users || 0}
              </p>
            </div>
          </div>

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

          <div className='bg-primary_muted p-6 rounded-lg shadow-lg'>
            <h2 className='text-lg font-bold font-montserrat text-secondary mb-4'>
              Ranking dos Leitores
            </h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider'>
                      Email
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider'>
                      Pontos
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider'>
                      Nível
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider'>
                      Dias Únicos
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider'>
                      Total de Acessos
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider'>
                      Último Acesso
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {stats?.topUsers.map((user, index) => (
                    <tr key={index}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-secondary'>
                        {user.email}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-secondary'>
                        {user.points}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-secondary'>
                        {user.level}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-secondary'>
                        {user.unique_days}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-secondary'>
                        {user.total_accesses}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-secondary'>
                        {formatDate(user.last_access)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
