import { query } from "@/app/lib/postgres"

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

interface VerificationResult {
  isDuplicate: boolean
  lastAccessData?: {
    email: string
    timestamp: Date
    postId: string
  }
}

export async function verifyWebhook(req: Request): Promise<VerificationResult> {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")
  const id = searchParams.get("id")

  console.log("Verificando webhook:", {
    email,
    id,
    params: searchParams.toString(),
  })

  if (!email || !id) {
    console.error("Parâmetros inválidos no webhook:", { email, id })
    throw new Error("Parâmetros inválidos")
  }

  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      const normalizedId = id.startsWith("post_") ? id : `post_${id}`

      // Primeiro verifica se o usuário existe
      const userResult = await query("SELECT id FROM users WHERE email = $1", [
        email,
      ])

      console.log("Resultado da busca do usuário:", {
        email,
        found: userResult.rows.length > 0,
      })

      // Se o usuário não existe, permite o registro
      if (userResult.rows.length === 0) {
        console.log("Usuário não encontrado, permitindo registro:", email)
        return { isDuplicate: false }
      }

      const userId = userResult.rows[0].id

      // Busca o último acesso do usuário primeiro
      const lastAccessResult = await query(
        `SELECT a.timestamp, a.post_id, u.email 
         FROM accesses a 
         JOIN users u ON u.id = a.user_id 
         WHERE a.user_id = $1 
         ORDER BY a.timestamp DESC 
         LIMIT 1`,
        [userId],
      )

      const lastAccess = lastAccessResult.rows[0]?.timestamp

      // Verifica se existe acesso recente para este post
      const result = await query(
        `SELECT EXISTS (
          SELECT 1 FROM accesses
          WHERE user_id = $1 
          AND post_id = $2
          AND timestamp >= NOW() - INTERVAL '1 minute'
        )`,
        [userId, normalizedId],
      )

      // Se existe acesso recente, retorna os dados do último acesso
      if (result.rows[0].exists && lastAccessResult.rows[0]) {
        console.log("Acesso muito próximo detectado:", {
          userId,
          postId: normalizedId,
          lastAccess: lastAccess,
        })

        return {
          isDuplicate: true,
          lastAccessData: {
            email: lastAccessResult.rows[0].email,
            timestamp: lastAccessResult.rows[0].timestamp,
            postId: lastAccessResult.rows[0].post_id,
          },
        }
      }

      return { isDuplicate: false }
    } catch (error) {
      console.error("Erro na verificação do webhook:", error)
      retries++
      if (retries === MAX_RETRIES) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
    }
  }

  throw new Error("Erro ao verificar webhook após várias tentativas")
}
