import { NextResponse } from "next/server"
import { generateRandomAccesses } from "@/app/lib/cron"
import { NextRequest } from "next/server"

/**
 * Endpoint para ser chamado pelo GitHub Actions Cron
 * Como este endpoint não exige autenticação, adicionamos uma verificação simples
 * para ajudar a evitar acessos não autorizados
 */
export async function GET(request: NextRequest) {
  try {
    // Verificação de segurança simples
    // Verifica se o User-Agent contém "GitHub-Actions" ou "curl"
    // ou se a solicitação vem de um IP confiável
    const userAgent = request.headers.get('user-agent') || '';
    const isGitHubActions = userAgent.includes('GitHub-Actions') || userAgent.includes('curl');
    
    // Para ambientes de desenvolvimento, permitir localhost
    const referer = request.headers.get('referer') || '';
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                          referer.includes('localhost') || 
                          referer.includes('127.0.0.1');
    
    if (!isGitHubActions && !isDevelopment) {
      console.warn('Tentativa de acesso não autorizado ao cron:', { userAgent, referer });
      return NextResponse.json(
        {
          success: false,
          message: "Acesso não autorizado"
        },
        { status: 403 }
      );
    }

    // Executar a geração de acessos aleatórios
    const result = await generateRandomAccesses();
    
    return NextResponse.json({
      success: true,
      message: "Cron executado com sucesso via GitHub Actions",
      result
    });
  } catch (error) {
    console.error("Erro ao executar cron:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao executar cron",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
} 