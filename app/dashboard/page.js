"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
          <h1 className='text-xl font-bold font-verdana text-secondary mb-8 lg:text-xl'>
            Olá, {session?.user?.email}!
          </h1>

          {stats?.currentStreak > 0 && (
            <div className='mb-8 bg-white p-4 rounded-lg border-2 border-primary'>
              <p className='text-lg font-medium font-poppins text-secondary'>
                {getStreakMessage(stats.currentStreak)}
              </p>
            </div>
          )}

          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='bg-white overflow-hidden shadow rounded-lg border-2 border-primary'>
              <div className='px-4 py-5 sm:p-6'>
                <dt className='text-sm font-medium font-poppins text-secondary truncate'>
                  Streak Atual
                </dt>
                <dd className='mt-1 text-3xl font-semibold font-montserrat text-primary'>
                  {stats?.currentStreak || 0} dias
                </dd>
              </div>
            </div>

            <div className='bg-white overflow-hidden shadow rounded-lg border-2 border-primary'>
              <div className='px-4 py-5 sm:p-6'>
                <dt className='text-sm font-medium font-poppins text-secondary truncate'>
                  Maior Streak
                </dt>
                <dd className='mt-1 text-3xl font-semibold font-montserrat text-primary'>
                  {stats?.longestStreak || 0} dias
                </dd>
              </div>
            </div>

            <div className='bg-white overflow-hidden shadow rounded-lg border-2 border-primary'>
              <div className='px-4 py-5 sm:p-6'>
                <dt className='text-sm font-medium font-poppins text-secondary truncate'>
                  Total de Acessos
                </dt>
                <dd className='mt-1 text-3xl font-semibold font-montserrat text-primary'>
                  {stats?.totalAccesses || 0}
                </dd>
              </div>
            </div>
          </div>

          <div className='mt-8'>
            <h2 className='text-lg font-medium font-verdana text-secondary mb-4'>
              Histórico de Acessos
            </h2>
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
