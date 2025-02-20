import React from "react"
import { formatDate } from "@/app/utils/utils"

function ReadersRanking({ users }: { users: any }) {
  return (
    <div className='bg-primary_muted p-6 rounded-lg shadow-lg mb-8'>
      <h2 className='text-lg font-bold font-montserrat text-secondary mb-4'>
        Ranking dos leitores
      </h2>
      <div className='overflow-x-auto'>
        <div className='max-h-[500px] overflow-y-auto'>
          <table className='min-w-full'>
            <thead className='bg-primary_muted sticky top-0'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider'>
                  Pontos
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider'>
                  Nível
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider'>
                  Dias Únicos
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider'>
                  Total de Acessos
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-secondary_muted uppercase tracking-wider'>
                  Último Acesso
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-white/50'>
              {users?.map((user: any, index: number) => (
                <tr
                  key={index}
                >
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-secondary'>
                    {user.email}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-secondary'>
                    {user.points}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-secondary'>
                    {user.level}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-secondary'>
                    {user.unique_days}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-secondary'>
                    {user.total_accesses}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-secondary'>
                    {formatDate(user.last_access)}
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

export default ReadersRanking
