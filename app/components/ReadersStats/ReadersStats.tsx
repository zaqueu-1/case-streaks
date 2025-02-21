import React from "react"

interface StatsOverview {
  total_users: number
  avg_streak: number
  active_users: number
}

interface ReadersStatsProps {
  overview?: StatsOverview
}

export default function ReadersStats({ overview }: ReadersStatsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
      <div className='bg-primary_muted p-6 rounded-lg shadow-lg'>
        <h3 className='text-sm font-medium text-secondary_muted'>
          Total de Leitores
        </h3>
        <p className='text-3xl font-bold text-secondary mt-2'>
          {overview?.total_users || 0}
        </p>
      </div>
      <div className='bg-primary_muted p-6 rounded-lg shadow-lg'>
        <h3 className='text-sm font-medium text-secondary_muted'>
          Média de Streak
        </h3>
        <p className='text-3xl font-bold text-secondary mt-2'>
          {overview?.avg_streak?.toFixed(1) || "0.0"}
        </p>
      </div>
      <div className='bg-primary_muted p-6 rounded-lg shadow-lg'>
        <h3 className='text-sm font-medium text-secondary_muted'>
          Leitores Ativos
        </h3>
        <p className='text-3xl font-bold text-secondary mt-2'>
          {overview?.active_users || 0}
        </p>
      </div>
    </div>
  )
}
