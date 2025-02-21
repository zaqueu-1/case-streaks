import React, { useState, useMemo } from "react"
import { formatDate } from "@/app/utils/utils"

type SortKey =
  | "email"
  | "points"
  | "level"
  | "unique_days"
  | "max_streak"
  | "total_accesses"
  | "last_access"
type SortDirection = "asc" | "desc"

interface Reader {
  email: string
  points: number
  level: number
  unique_days: number
  max_streak: number
  total_accesses: number
  last_access: string | null
}

interface ReadersRankingProps {
  users: Reader[] | undefined
}

export default function ReadersRanking({ users }: ReadersRankingProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey
    direction: SortDirection
  }>({
    key: "points",
    direction: "desc",
  })

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }))
  }

  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return []

    return [...users]
      .filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        if (sortConfig.key === "last_access") {
          const dateA = a[sortConfig.key]
            ? new Date(a[sortConfig.key] as string).getTime()
            : 0
          const dateB = b[sortConfig.key]
            ? new Date(b[sortConfig.key] as string).getTime()
            : 0
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA
        }

        const valueA = a[sortConfig.key]
        const valueB = b[sortConfig.key]

        if (typeof valueA === "number" && typeof valueB === "number") {
          return sortConfig.direction === "asc"
            ? valueA - valueB
            : valueB - valueA
        }

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortConfig.direction === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA)
        }

        return 0
      })
  }, [users, searchTerm, sortConfig])

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return "↕️"
    return sortConfig.direction === "asc" ? "↑" : "↓"
  }

  return (
    <div className='bg-primary_muted p-6 rounded-lg shadow-lg mb-8'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-bold font-montserrat text-secondary_muted'>
          Ranking dos leitores
        </h2>

        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <svg
              className='h-5 w-5 text-gray-400'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <input
            type='text'
            placeholder='Buscar por e-mail...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-[250px] pl-10 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
          />
        </div>
      </div>

      <div className='overflow-x-auto'>
        <div className='max-h-[500px] overflow-y-auto rounded-lg'>
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            div::-webkit-scrollbar-track {
              background: #fff4d1;
              border-radius: 4px;
            }
            div::-webkit-scrollbar-thumb {
              background: #eecd3b;
              border-radius: 4px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #e2b800;
            }
          `}</style>
          <table className='min-w-full'>
            <thead className='bg-primary_muted sticky top-0'>
              <tr>
                <th
                  onClick={() => handleSort("email")}
                  className='px-4 py-2 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider cursor-pointer hover:bg-primary/10'
                >
                  Email {getSortIcon("email")}
                </th>
                <th
                  onClick={() => handleSort("points")}
                  className='px-4 py-2 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider cursor-pointer hover:bg-primary/10'
                >
                  Pontos {getSortIcon("points")}
                </th>
                <th
                  onClick={() => handleSort("level")}
                  className='px-4 py-2 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider cursor-pointer hover:bg-primary/10'
                >
                  Nível {getSortIcon("level")}
                </th>
                <th
                  onClick={() => handleSort("unique_days")}
                  className='px-4 py-2 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider cursor-pointer hover:bg-primary/10'
                >
                  Dias Únicos {getSortIcon("unique_days")}
                </th>
                <th
                  onClick={() => handleSort("max_streak")}
                  className='px-4 py-2 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider cursor-pointer hover:bg-primary/10'
                >
                  Maior Streak {getSortIcon("max_streak")}
                </th>
                <th
                  onClick={() => handleSort("total_accesses")}
                  className='px-4 py-2 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider cursor-pointer hover:bg-primary/10'
                >
                  Acessos {getSortIcon("total_accesses")}
                </th>
                <th
                  onClick={() => handleSort("last_access")}
                  className='px-4 py-2 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider cursor-pointer hover:bg-primary/10'
                >
                  Último Acesso {getSortIcon("last_access")}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-white/50'>
              {filteredAndSortedUsers.map((user: Reader, index: number) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-[#fff3c9]" : "bg-[#fee594]"}
                >
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-secondary'>
                    {user.email}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-secondary'>
                    {user.points}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-secondary'>
                    {user.level}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-secondary'>
                    {user.unique_days}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-secondary'>
                    {user.max_streak} {user.max_streak === 1 ? "dia" : "dias"}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-secondary'>
                    {user.total_accesses}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-secondary'>
                    {user.last_access ? formatDate(user.last_access) : "-"}
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
