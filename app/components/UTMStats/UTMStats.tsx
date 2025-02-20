import React from 'react'

function UTMStats({ title, data }: { title: string, data: any }) {
  return (
    <div>
        <h3 className='text-md font-semibold text-secondary mb-3'>
        {title == "Canal" ? "Canais" : title + "s"}
        </h3>
        <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-white/50'>
                <thead>
                <tr>
                    <th className='px-4 py-2 text-left text-xs font-medium text-secondary_muted'>
                    {title}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-medium text-secondary_muted'>
                    Acessos
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-medium text-secondary_muted'>
                    %
                    </th>
                </tr>
                </thead>
                <tbody className='divide-y divide-white/50'>
                {data?.map((entry: any, index: any) => (
                    <tr key={index}>
                        <td className='px-4 py-2 text-sm text-secondary'>
                            {entry.value == "unknown" ? "Não classificado" : entry.value}
                        </td>
                        <td className='px-4 py-2 text-sm text-secondary'>
                            {entry.count}
                        </td>
                        <td className='px-4 py-2 text-sm text-secondary'>
                            {entry.percentage}%
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default UTMStats
