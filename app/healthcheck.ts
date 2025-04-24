const cron = require("node-cron")

async function checkHealth() {
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

cron.schedule("*/14 * * * *", checkHealth)
