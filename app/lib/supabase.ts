import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL 
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente não configuradas')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase

export async function executeQuery<T = any>(
  query: string, 
  params?: any[]
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      query_text: query,
      query_params: params || []
    })

    if (error) {
      console.error('Erro ao executar query:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Erro ao executar query:', error)
    return { data: null, error: error as Error }
  }
} 