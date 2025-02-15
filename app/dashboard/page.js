"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  formatDate,
  getStreakMessage,
  calculateLevelProgress,
} from "../utils/utils"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats?email=${session.user.email}`)
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
            <div className='flex items-center'>
              <div className='flex flex-col items-center'>
                <div className='relative'>
                  <div className='w-16 h-16 rounded-full bg-primary_muted flex items-center justify-center'>
                    <span className='text-xl font-bold font-montserrat text-secondary flex items-center gap-1'>
                      <span className='text-xs font-light'>lv</span>
                      {stats?.level || 1}
                    </span>
                  </div>
                </div>
                <div className='mt-2 w-24'>
                  <div className='relative h-2 w-full bg-gray-200 rounded-full overflow-hidden'>
                    <div
                      className='absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out'
                      style={{
                        width: `${calculateLevelProgress(
                          stats?.points || 0,
                          stats?.level || 1,
                        )}%`,
                      }}
                    />
                  </div>
                  <div className='mt-1 flex gap-1 justify-end text-[10px] font-poppins text-secondary'>
                    <span>{stats?.pointsToNextLevel || 5}xp para o</span>
                    <span className='text-primary underline'>
                      nível {stats?.level + 1}!
                    </span>
                  </div>
                </div>
              </div>
            </div>
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

          <div className='mt-10 grid grid-cols-1 gap-2 w-full md:grid-cols-3 place-items-center mx-auto md:w-[80%]'>
            <div className='bg-primary_muted overflow-hidden shadow aspect-square rounded-full max-w-[180px] w-full'>
              <div className='h-full flex flex-col items-center justify-center p-4 gap-1'>
                <span className='text-5xl'>
                    ☕
                </span>
                <span className='text-[10px] mt-4 font-light font-poppins text-secondary'>
                  Streak Atual
                </span>
                <span className='text-xl font-semibold font-montserrat text-secondary'>
                  {stats?.currentStreak || 0} {stats?.currentStreak == 1 ? "dia" : "dias"}
                </span>
              </div>
            </div>

            <div className='bg-primary_muted overflow-hidden shadow aspect-square rounded-full max-w-[180px] w-full'>
              <div className='h-full flex flex-col items-center justify-center p-4 gap-1'>
                <div className='w-14 h-14 flex items-center justify-center'>
                    <span className="text-5xl">
                        🚀
                    </span>
                </div>
                <span className='text-[10px] mt-4 font-light font-poppins text-secondary'>
                  Maior Streak
                </span>
                <span className='text-xl font-semibold font-montserrat text-secondary'>
                  {stats?.longestStreak || 0} {stats?.currentStreak == 1 ? "dia" : "dias"}
                </span>
              </div>
            </div>

            <div className='bg-primary_muted overflow-hidden shadow aspect-square rounded-full max-w-[180px] w-full'>
              <div className='h-full flex flex-col items-center justify-center p-4 gap-1'>
                <div className='w-14 h-14 flex items-center justify-center'>
                    <span className="text-5xl">
                        📱
                    </span>
                </div>
                <span className='text-[10px] mt-4 font-light font-poppins text-secondary'>
                  Total de Acessos
                </span>
                <span className='text-xl font-semibold font-montserrat text-secondary'>
                  {stats?.totalAccesses || 0} {stats?.totalAccesses == 1 ? "acesso" : "acessos"}
                </span>
              </div>
            </div>
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
