/**
 * Função que gera acessos aleatórios
 * Esta função será chamada pelo endpoint que é acionado pelo GitHub Actions
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