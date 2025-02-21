import React from 'react'
import { Line } from 'react-chartjs-2'

interface ReadersEngagementProps {
  chartData: any
}

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

function ReadersEngagement({ chartData }: ReadersEngagementProps) {
  return (
    <div className='bg-primary_muted p-6 rounded-lg shadow-lg mb-8'>
    <h2 className='text-lg font-bold font-montserrat text-secondary_muted mb-4'>
      Engajamento ao Longo do Tempo
    </h2>
    <div className='h-64 flex items-center justify-center'>
      {chartData.datasets.length > 0 && (
        <Line options={chartOptions} data={chartData} />
      )}
    </div>
  </div>
  )
}

export default ReadersEngagement
