// Este arquivo é executado apenas no servidor
if (typeof window === 'undefined') {
  const cron = require("node-cron")

  async function checkHealth() {
    console.log("Rodando healthcheck a cada 14 min")

    try {
      const apiUrl = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/healthcheck` : null
      
      if (!apiUrl) {
        console.log("NEXTAUTH_URL não definido, pulando healthcheck")
        return
      }

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

  cron.schedule("*/14 * * * *", checkHealth)
}
