import { NextResponse } from "next/server"
import supabase from "@/app/lib/supabase"
import { StatsResponse, RecentAccess } from "@/app/types/news"
import { NextRequest } from "next/server"
import { calculateLevelAndPoints } from "@/app/utils/utils"

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(
  req: NextRequest,
): Promise<NextResponse<StatsResponse | { error: string }>> {
  try {
    const email = req.nextUrl.searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email não fornecido" },
        { status: 400 },
      )
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, points, level, is_admin, last_access')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error("Erro ao buscar usuário:", userError);
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      )
    }

    const { data: accessesCountData, error: accessesCountError } = await supabase
      .from('accesses')
      .select('id', { count: 'exact' })
      .eq('user_id', userData.id);

    const totalAccesses = accessesCountError ? 0 : (accessesCountData?.length || 0);

    const { data: firstAccessData, error: firstAccessError } = await supabase
      .from('accesses')
      .select('timestamp')
      .eq('user_id', userData.id)
      .order('timestamp', { ascending: true })
      .limit(1);

    const firstAccess = firstAccessData && firstAccessData.length > 0 
      ? firstAccessData[0].timestamp 
      : userData.last_access;

    const { data: allAccessesData, error: allAccessesError } = await supabase
      .from('accesses')
      .select('timestamp')
      .eq('user_id', userData.id)
      .order('timestamp', { ascending: true });

    let currentStreak = 0;
    let longestStreak = 0;

    if (allAccessesData && allAccessesData.length > 0) {
      currentStreak = 1;
      longestStreak = 1;

      if (allAccessesData.length > 1) {
        const uniqueDates = new Set<string>();
        allAccessesData.forEach(access => {
          if (access && access.timestamp) {
            const date = new Date(access.timestamp as string);
            uniqueDates.add(date.toISOString().split('T')[0]);
          }
        });

        if (uniqueDates.size > 1) {
          const sortedDates = Array.from(uniqueDates).sort();
          
          let tempStreak = 1;
          let maxStreak = 1;
          
          for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i-1]);
            const currDate = new Date(sortedDates[i]);
            
            const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              tempStreak++;
              maxStreak = Math.max(maxStreak, tempStreak);
            } else {
              tempStreak = 1;
            }
          }
          
          longestStreak = maxStreak;
          
          const lastDate = new Date(sortedDates[sortedDates.length - 1]);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {

            currentStreak = tempStreak;
          } else {
            currentStreak = 0;
          }
        }
      }
    }

    const { data: recentAccessesData, error: recentAccessesError } = await supabase
      .from('accesses')
      .select('id, post_id, timestamp, utm_source, utm_medium, utm_campaign, utm_channel')
      .eq('user_id', userData.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (recentAccessesError) {
      console.error("Erro ao buscar acessos recentes:", recentAccessesError);
    }

    const recentAccesses: RecentAccess[] = [];
    if (recentAccessesData) {
      recentAccessesData.forEach(access => {
        recentAccesses.push({
          id: access.id,
          post_id: access.post_id,
          timestamp: access.timestamp,
          utm_source: access.utm_source,
          utm_medium: access.utm_medium,
          utm_campaign: access.utm_campaign,
          utm_channel: access.utm_channel
        });
      });
    }

    const points = userData.points || 0;
    const level = userData.level || 1;
    const levelInfo = calculateLevelAndPoints(points);

    const utmStats = {
      sources: {},
      mediums: {},
      campaigns: {},
      channels: {},
    };

    const response: StatsResponse = {
      email: userData.email,
      totalAccesses: totalAccesses,
      firstAccess: firstAccess,
      lastAccess: userData.last_access,
      currentStreak: currentStreak,
      longestStreak: longestStreak,
      points: points,
      level: level,
      pointsToNextLevel: levelInfo.pointsToNextLevel,
      currentLevelPoints: levelInfo.currentLevelPoints,
      utmStats: utmStats,
      recentAccesses: recentAccesses,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    if (error instanceof Error) {
      console.error("Detalhes do erro:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
