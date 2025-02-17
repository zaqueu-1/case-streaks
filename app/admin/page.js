"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
      return
    }

    if (status === "authenticated" && !session.user.isAdmin) {
      router.replace("/dashboard")
      return
    }

    setLoading(false)
  }, [status, router, session])

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
          {/* Header */}
          <div className='flex flex-col items-start mb-8'>
            <h1 className='text-3xl font-bold font-montserrat text-secondary'>
              Dashboard Administrativo
            </h1>
            <p className='text-sm font-poppins text-secondary_muted mt-2'>
              Monitore o engajamento dos leitores do the news
            </p>
          </div>

          {/* Filtros */}
          <div className='bg-white p-4 rounded-lg shadow-lg border-2 border-primary mb-8'>
            <h2 className='text-lg font-bold font-montserrat text-secondary mb-4'>
              Filtros
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='flex flex-col'>
                <label className='text-sm font-medium text-secondary_muted mb-2'>
                  Período
                </label>
                <select className='border-2 border-primary_muted rounded-md p-2 text-secondary'>
                  <option value='7'>Últimos 7 dias</option>
                  <option value='30'>Últimos 30 dias</option>
                  <option value='90'>Últimos 90 dias</option>
                </select>
              </div>
              <div className='flex flex-col'>
                <label className='text-sm font-medium text-secondary_muted mb-2'>
                  Status do Streak
                </label>
                <select className='border-2 border-primary_muted rounded-md p-2 text-secondary'>
                  <option value='all'>Todos</option>
                  <option value='active'>Streak Ativo</option>
                  <option value='broken'>Streak Quebrado</option>
                </select>
              </div>
              <div className='flex flex-col'>
                <label className='text-sm font-medium text-secondary_muted mb-2'>
                  Newsletter
                </label>
                <select className='border-2 border-primary_muted rounded-md p-2 text-secondary'>
                  <option value='all'>Todas</option>
                  <option value='daily'>Daily</option>
                  <option value='weekly'>Weekly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            {/* Total de Leitores */}
            <div className='bg-white p-6 rounded-lg shadow-lg border-2 border-primary'>
              <h3 className='text-sm font-medium text-secondary_muted'>
                Total de Leitores
              </h3>
              <p className='text-3xl font-bold text-secondary mt-2'>-</p>
            </div>
            {/* Média de Streak */}
            <div className='bg-white p-6 rounded-lg shadow-lg border-2 border-primary'>
              <h3 className='text-sm font-medium text-secondary_muted'>
                Média de Streak
              </h3>
              <p className='text-3xl font-bold text-secondary mt-2'>-</p>
            </div>
            {/* Leitores Ativos */}
            <div className='bg-white p-6 rounded-lg shadow-lg border-2 border-primary'>
              <h3 className='text-sm font-medium text-secondary_muted'>
                Leitores Ativos
              </h3>
              <p className='text-3xl font-bold text-secondary mt-2'>-</p>
            </div>
            {/* Taxa de Engajamento */}
            <div className='bg-white p-6 rounded-lg shadow-lg border-2 border-primary'>
              <h3 className='text-sm font-medium text-secondary_muted'>
                Taxa de Engajamento
              </h3>
              <p className='text-3xl font-bold text-secondary mt-2'>-</p>
            </div>
          </div>

          {/* Placeholder para Gráficos */}
          <div className='bg-white p-6 rounded-lg shadow-lg border-2 border-primary mb-8'>
            <h2 className='text-lg font-bold font-montserrat text-secondary mb-4'>
              Engajamento ao Longo do Tempo
            </h2>
            <div className='h-64 flex items-center justify-center bg-gray-50 rounded-lg'>
              <p className='text-secondary_muted'>Gráficos em breve</p>
            </div>
          </div>

          {/* Placeholder para Ranking */}
          <div className='bg-white p-6 rounded-lg shadow-lg border-2 border-primary'>
            <h2 className='text-lg font-bold font-montserrat text-secondary mb-4'>
              Top Leitores
            </h2>
            <div className='h-64 flex items-center justify-center bg-gray-50 rounded-lg'>
              <p className='text-secondary_muted'>Ranking em breve</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
