import React, { useState } from "react"
import UTMStats from "../UTMStats/UTMStats"
import { AdminStats } from "@/app/types/admin"

interface ReadersAccessStatisticsProps {
  stats: AdminStats | null
}

export default function ReadersAccessStatistics({
  stats,
}: ReadersAccessStatisticsProps) {
  const [selectedPost, setSelectedPost] = useState<string>("")
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  })
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(false)

  const toggleFilter = () => {
    setIsDateFilterVisible(!isDateFilterVisible)
    if (isDateFilterVisible) {
      setDateRange({ start: "", end: "" })
    } else {
      setSelectedPost("")
    }
  }

  return (
    <div className='bg-primary_muted p-6 rounded-lg shadow-lg mb-8'>
      <h2 className='text-lg font-bold font-montserrat text-secondary_muted mb-4'>
        Estatísticas de acessos
      </h2>

      <div className='mb-6 flex flex-wrap items-center justify-start gap-2'>
        {!isDateFilterVisible ? (
          <div>
            <select
              value={selectedPost}
              onChange={(e) => setSelectedPost(e.target.value)}
              className='w-[200px] text-secondary_muted p-1 bg-whitesmoke border-2 border-secondary_muted/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary'
            >
              <option value=''>Todas as newsletters</option>
              {stats?.posts?.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className='flex gap-2'>
            <input
              type='date'
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  start: e.target.value,
                }))
              }
              className='flex-1 text-secondary_muted p-1 bg-whitesmoke border-2 border-secondary_muted/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary'
            />
            <input
              type='date'
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className='flex-1 text-secondary_muted p-1 bg-whitesmoke border-2 border-secondary_muted/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </div>
        )}

        <button
          onClick={toggleFilter}
          className='px-4 py-1 text-sm font-medium border-2 border-secondary_muted/30 text-secondary bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary'
        >
          {isDateFilterVisible
            ? "Filtrar por newsletter"
            : "Filtrar por período"}
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <UTMStats
          title='Fonte'
          data={
            stats?.utmStats?.sources?.map((item) => ({
              ...item,
              post_id: item.post_id || "",
              timestamp: item.timestamp || "",
            })) || []
          }
          selectedPost={selectedPost}
          dateRange={dateRange}
        />

        <UTMStats
          title='Meio'
          data={
            stats?.utmStats?.mediums?.map((item) => ({
              ...item,
              post_id: item.post_id || "",
              timestamp: item.timestamp || "",
            })) || []
          }
          selectedPost={selectedPost}
          dateRange={dateRange}
        />

        <UTMStats
          title='Campanha'
          data={
            stats?.utmStats?.campaigns?.map((item) => ({
              ...item,
              post_id: item.post_id || "",
              timestamp: item.timestamp || "",
            })) || []
          }
          selectedPost={selectedPost}
          dateRange={dateRange}
        />

        <UTMStats
          title='Canal'
          data={
            stats?.utmStats?.channels?.map((item) => ({
              ...item,
              post_id: item.post_id || "",
              timestamp: item.timestamp || "",
            })) || []
          }
          selectedPost={selectedPost}
          dateRange={dateRange}
        />
      </div>
    </div>
  )
}
