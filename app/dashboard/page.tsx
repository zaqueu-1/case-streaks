"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import StatsCard from "../components/StatsCard/StatsCard"
import LevelBadge from "../components/LevelBadge/LevelBadge"
import AccessCalendar from "../components/AccessCalendar/AccessCalendar"
import Achievements from "../components/Achievements/Achievements"
import ShareButton from "../components/ShareButton/ShareButton"
import { getStreakMessage } from "../utils/utils"
import { StatsResponse } from "../types/news"
import { Achievement } from "../types/components"
import Loader from "@/app/components/Loader/Loader"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [achievements, setAchievements] = useState<Achievement[]>([])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats?email=${session?.user?.email}`)
      const data = await response.json()
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
  }, [status, router])

  useEffect(() => {
    if (session?.user?.email) {
      fetchStats()
    }
  }, [session])

  if (status === "loading" || loading) {
    return <Loader className='min-h-screen' />
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
              {stats?.currentStreak && stats.currentStreak > 0 && (
                <p className='text-xs font-verdana text-secondary_muted italic md:text-sm'>
                  {getStreakMessage(stats.currentStreak)}
                </p>
              )}
            </div>
          </div>

          <Achievements stats={stats} onAchievementsUpdate={setAchievements} />

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

          <ShareButton stats={stats} />
        </div>
      </div>
    </div>
  )
}
