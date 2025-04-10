import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import supabase from "@/app/lib/supabase"

const emails = [
  "usuario1@exemplo.com",
  "usuario2@exemplo.com",
  "usuario3@exemplo.com",
  "usuario4@exemplo.com",
  "usuario5@exemplo.com",
  "usuario6@exemplo.com",
  "usuario7@exemplo.com",
  "usuario8@exemplo.com",
  "usuario9@exemplo.com",
  "usuario10@exemplo.com",
]

const utmSources = ["facebook", "twitter", "linkedin", "direct", "newsletter", "instagram"]
const utmMediums = ["social", "email", "referral", "organic", "paid"]
const utmCampaigns = ["summer_campaign", "product_launch", "weekly_digest", "promotion"]
const utmChannels = ["web", "mobile", "app"]

function getRandomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

function generateRandomPostId(): string {
  const postId = `post_${randomBytes(8).toString("hex")}`
  return postId
}

async function processUserAccess(email: string, postId: string, utmParams: any) {
  try {
    const { data, error } = await supabase.rpc('register_access', {
      p_email: email,
      p_post_id: postId,
      p_utm_source: utmParams.utmSource || null,
      p_utm_medium: utmParams.utmMedium || null,
      p_utm_campaign: utmParams.utmCampaign || null,
      p_utm_channel: utmParams.utmChannel || null
    })
    
    if (error) {
      console.error(`Erro ao processar acesso para ${email}:`, error)
      throw error
    }
    
    return { 
      email, 
      postId, 
      timestamp: data.timestamp,
      points: data.points,
      level: data.level,
      totalAccesses: data.total_accesses
    }
  } catch (error) {
    console.error(`Erro ao processar acesso para ${email}:`, error)
    throw error
  }
}

export async function GET(req: Request) {
  try {
    const numberOfAccesses = Math.floor(Math.random() * 5) + 1
    const results = []

    for (let i = 0; i < numberOfAccesses; i++) {
      const email = getRandomItem(emails) || emails[0]
      const postId = generateRandomPostId()
      
      const utmParams = {
        utmSource: Math.random() > 0.3 ? getRandomItem(utmSources) : undefined,
        utmMedium: Math.random() > 0.4 ? getRandomItem(utmMediums) : undefined,
        utmCampaign: Math.random() > 0.5 ? getRandomItem(utmCampaigns) : undefined,
        utmChannel: Math.random() > 0.6 ? getRandomItem(utmChannels) : undefined,
      }

      const result = await processUserAccess(email, postId, utmParams)
      results.push(result)
    }

    console.log("Executando limpeza de duplicatas...")
    const { data: cleanupData, error: cleanupError } = await supabase.rpc('remove_duplicate_accesses')
    
    if (cleanupError) {
      console.error("Erro ao limpar duplicatas:", cleanupError)
    }
    
    const duplicatesRemoved = cleanupData ? cleanupData.length : 0
    console.log("Duplicatas removidas:", duplicatesRemoved)

    return NextResponse.json({
      message: "Acessos aleatórios gerados com sucesso",
      accessesGenerated: results.length,
      duplicatesRemoved,
      results
    })
  } catch (error) {
    console.error("Erro ao gerar acessos aleatórios:", error)
    return NextResponse.json(
      {
        message: "Erro ao gerar acessos aleatórios",
        error: (error as Error).message,
      },
      { status: 500 }
    )
  }
} 