"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import StatsCard from "../components/StatsCard/StatsCard"
import LevelBadge from "../components/LevelBadge/LevelBadge"
import AccessCalendar from "../components/AccessCalendar/AccessCalendar"
import { formatDate, getStreakMessage } from "../utils/utils"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats?email=${session.user.email}`)
      const data = await response.json()
      console.log("Stats completos:", data)
      setStats(data)
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router, session])

  useEffect(() => {
    if (session?.user?.email) {
      fetchStats()
    }
  }, [session])

  if (status === "loading" || loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Carregando...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='flex flex-col items-center justify-start mb-4'>
            <LevelBadge stats={stats} />
            <div className='flex flex-col items-center mt-4 text-center gap-2'>
              <h1 className='text-2xl font-bold font-verdana text-secondary md:text-4xl'>
                Olá, {session?.user?.email}!
              </h1>
              {stats?.currentStreak > 0 && (
                <p className='text-xs font-verdana text-secondary_muted italic md:text-sm'>
                  {getStreakMessage(stats.currentStreak)}
                </p>
              )}
            </div>
          </div>

          <div className='mt-10 flex flex-col gap-8 items-center justify-center sm:flex-row'>
            <StatsCard
              icon={"☕"}
              title={"Streak Atual"}
              stat={stats?.currentStreak}
              keyword={"dia"}
            />
            <StatsCard
              icon={"🚀"}
              title={"Maior Streak"}
              stat={stats?.longestStreak}
              keyword={"dia"}
            />
            <StatsCard
              icon={"📱"}
              title={"Total de Acessos"}
              stat={stats?.totalAccesses}
              keyword={"acesso"}
            />
          </div>

          <div className='w-full mt-10'>
            <AccessCalendar accesses={stats?.recentAccesses || []} />
          </div>

          <div className='mt-8'>
            <div className='bg-white shadow overflow-hidden sm:rounded-lg border-2 border-primary'>
              <ul className='divide-y divide-gray-200'>
                {stats?.recentAccesses?.map((access) => (
                  <li key={access._id}>
                    <div className='px-4 py-4 sm:px-6'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium font-montserrat text-primary truncate'>
                          {access.id}
                        </p>
                        <div className='ml-2 flex-shrink-0 flex'>
                          <p className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-secondary'>
                            {formatDate(access.timestamp)}
                          </p>
                        </div>
                      </div>
                      {access.utmSource && (
                        <div className='mt-2 text-sm font-poppins text-secondary'>
                          Origem: {access.utmSource} | Meio: {access.utmMedium}{" "}
                          | Campanha: {access.utmCampaign}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
