
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

export async function verifyWebhook(req) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")
  const id = searchParams.get("id")

  if (!email || !id) {
    throw new Error("Parâmetros inválidos")
  }

  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      const response = await fetch(
        `${process.env.NEXTAUTH_URL}/api/stats?email=${email}`,
      )

      if (response.ok) {
        const data = await response.json()
        const hasAccess = data.recentAccesses?.some(
          (access) => access.id === id,
        )

        if (hasAccess) {
          throw new Error(
            `Acesso já registrado após ${retries + 1} tentativas`,
          )
        }

        return
      }

      if (response.status === 404) {
        return
      }

      throw new Error(`Erro na verificação: ${response.statusText}`)
    } catch (error) {
      retries++
      if (retries === MAX_RETRIES) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
    }
  }
}
