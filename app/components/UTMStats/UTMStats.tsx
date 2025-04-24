import React, { useState, useEffect } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

const colors = [
  "#e2b800",
  "#FFDF53",
  "#FFE47A",
  "#FFE999",
  "#FFEFB8",
  "#FFF4D1",
]

interface UTMData {
  value: string
  count: number
  percentage: number
  post_id?: string
  timestamp?: string
}

interface UTMStatsProps {
  title: string
  data?: UTMData[]
  selectedPost: string
  dateRange: {
    start: string
    end: string
  }
}

function UTMStats({
  title,
  data = [],
  selectedPost,
  dateRange,
}: UTMStatsProps) {
  const [filteredData, setFilteredData] = useState<UTMData[]>([])

  useEffect(() => {
    if (!data) return

    let filtered = [...data]

    if (selectedPost) {
      filtered = filtered.filter((item) => item.post_id === selectedPost)
    }

    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start)
      const end = new Date(dateRange.end)
      end.setHours(23, 59, 59) // Incluir o dia todo

      filtered = filtered.filter((item) => {
        if (!item.timestamp) return true
        const date = new Date(item.timestamp)
        return date >= start && date <= end
      })
    }

    const groupedData = filtered.reduce<Record<string, UTMData>>(
      (acc, item) => {
        const key = item.value
        if (!acc[key]) {
          acc[key] = { ...item }
        } else {
          acc[key].count += item.count
        }
        return acc
      },
      {},
    )

    const groupedArray = Object.values(groupedData)
    const total = groupedArray.reduce((sum, item) => sum + item.count, 0)

    const finalData = groupedArray
      .map((item) => ({
        ...item,
        percentage: total ? Number(((item.count / total) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.count - a.count) 

    setFilteredData(finalData)
  }, [data, selectedPost, dateRange])

  const chartData = {
    labels: filteredData.map((entry) =>
      entry.value === "unknown" ? "Não classificado" : entry.value,
    ),
    datasets: [
      {
        data: filteredData.map((entry) => entry.count),
        backgroundColor: colors,
        borderColor: "#cecece73",
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || ""
            const value = context.raw || 0
            const percentage = filteredData[context.dataIndex].percentage
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <div>
      <h3 className='text-md font-light text-secondary mb-2'>
        {title === "Canal" ? "Canais" : title + "s"}
      </h3>

      <div className='flex flex-col md:flex-row gap-2'>
        <div className='w-full md:w-1/2'>
          <div className='h-[200px] flex items-center justify-center'>
            {filteredData && filteredData.length > 0 ? (
              <Pie data={chartData} options={options} />
            ) : (
              <p className='text-sm text-secondary_muted'>
                Sem dados disponíveis
              </p>
            )}
          </div>
        </div>
        <div className='w-full md:w-1/2 overflow-x-hidden'>
          <table className='min-w-full'>
            <thead>
              <tr>
                <th className='px-2 py-1 text-left text-xs font-light text-secondary_muted'>
                  {title}
                </th>
                <th className='px-2 py-1 text-left text-xs font-light text-secondary_muted'>
                  Acessos
                </th>
                <th className='px-2 py-1 text-left text-xs font-light text-secondary_muted'>
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry, index) => (
                <tr key={index}>
                  <td className='px-2 py-1 text-sm text-secondary'>
                    {entry.value === "unknown"
                      ? "Não classificado"
                      : entry.value}
                  </td>
                  <td className='px-2 py-1 text-sm text-secondary'>
                    {entry.count}
                  </td>
                  <td className='px-2 py-1 text-sm text-secondary'>
                    {entry.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default UTMStats
