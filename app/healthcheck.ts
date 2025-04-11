const cron = require("node-cron")

async function checkHealth() {
  // Verifica se está rodando no servidor
  if (typeof window !== 'undefined') {
    return
  }

  console.log("Rodando healthcheck a cada 14 min")

  try {
    const apiUrl = `${process.env.NEXTAUTH_URL}/api/healthcheck`
    console.log("Checando API")
    const apiResponse = await fetch(apiUrl)

    if (apiResponse.status === 200) {
      console.log("API está de pé!")
    } else {
      console.error("API está com problemas!")
    }
  } catch (error) {
    console.error("Erro ao checar API:", error)
  }
}

// Verifica se está rodando no servidor antes de agendar o cron
if (typeof window === 'undefined') {
  cron.schedule("*/14 * * * *", checkHealth)
}
