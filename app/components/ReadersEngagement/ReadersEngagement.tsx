import React from "react"
import { Line } from "react-chartjs-2"
import { ChartData } from "chart.js"

interface ChartProps {
  chartData: ChartData<"line">
}

export default function ReadersEngagement({ chartData }: ChartProps) {
  return (
    <div className='bg-primary_muted p-6 rounded-lg shadow-lg mb-8'>
      <h2 className='text-lg font-bold font-montserrat text-secondary_muted mb-4'>
        Engajamento dos leitores
      </h2>
      <div className='w-full h-[400px]'>
        {chartData.datasets.length > 0 ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  type: "linear",
                  display: true,
                  position: "left",
                },
                y1: {
                  type: "linear",
                  display: true,
                  position: "right",
                  grid: {
                    drawOnChartArea: false,
                  },
                },
              },
            }}
          />
        ) : (
          <p className='text-center text-secondary_muted'>
            Nenhum dado disponível
          </p>
        )}
      </div>
    </div>
  )
}
