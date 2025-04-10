import cron from 'node-cron'

/**
 * Configura um cron job para gerar acessos aleatórios a cada hora
 * 
 * Na Vercel, os cron jobs tradicionais não funcionam devido à natureza serverless.
 * Esta função será chamada em ambientes de desenvolvimento para testes.
 * Em produção na Vercel, usaremos o Vercel Cron Jobs (https://vercel.com/docs/cron-jobs).
 */
export function setupCronJobs() {
  // Verifica se está no ambiente do servidor e não na Vercel
  if (typeof window === 'undefined' && process.env.VERCEL !== '1') {
    console.log('Configurando cron jobs localmente...')
    
    cron.schedule('0 * * * *', async () => {
      await generateRandomAccesses()
    })
    
    console.log('Cron jobs configurados com sucesso!')
  } else {
    console.log('Cron jobs não configurados: ambiente de produção Vercel ou navegador')
  }
}

/**
 * Função que gera acessos aleatórios
 * Esta função será chamada pelos endpoints Vercel Cron em produção
 * e pelo scheduler node-cron em desenvolvimento
 */
export async function generateRandomAccesses() {
  try {
    console.log(`Executando job para gerar acessos aleatórios: ${new Date().toISOString()}`)
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/cron/random-accesses`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Erro ao chamar API: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('Resultado da geração de acessos:', result)
    return result
  } catch (error) {
    console.error('Erro ao executar geração de acessos aleatórios:', error)
    throw error
  }
} 