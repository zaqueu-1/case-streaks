const MAX_RETRIES = 3

export async function verifyWebhook(request) {
  const retryCount = parseInt(request.headers.get("x-retry-count") || "0")

  if (retryCount >= MAX_RETRIES) {
    throw new Error("Número máximo de tentativas excedido")
  }

  return true
}
