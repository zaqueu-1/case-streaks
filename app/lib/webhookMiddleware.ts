import { query } from "./postgres"

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

export async function verifyWebhook(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")
  const id = searchParams.get("id")

  if (!email || !id) {
    throw new Error("Parâmetros inválidos")
  }

  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      const normalizedId = id.startsWith("post_") ? id : `post_${id}`
      const now = new Date()
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(now)
      todayEnd.setHours(23, 59, 59, 999)

      // Primeiro verifica se o usuário existe
      const userResult = await query("SELECT id FROM users WHERE email = $1", [
        email,
      ])

      // Se o usuário não existe, permite o registro
      if (userResult.rows.length === 0) {
        return
      }

      const userId = userResult.rows[0].id

      // Verifica se já existe acesso hoje para este post
      const result = await query(
        `SELECT EXISTS (
          SELECT 1 FROM accesses
          WHERE user_id = $1 
          AND post_id = $2
          AND timestamp BETWEEN $3 AND $4
        )`,
        [userId, normalizedId, todayStart, todayEnd],
      )

      if (result.rows[0].exists) {
        throw new Error(
          `Acesso já registrado hoje após ${retries + 1} tentativas`,
        )
      }

      return
    } catch (error) {
      retries++
      if (retries === MAX_RETRIES) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
    }
  }
}
