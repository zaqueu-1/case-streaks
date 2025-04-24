"use client"

import { useEffect, useMemo } from "react"
import achievementsData from "../../data/achievements.json"
import { AchievementsProps } from "../../types/components"

export default function Achievements({
  stats,
  onAchievementsUpdate,
}: AchievementsProps) {
  const achievements = useMemo(() => {
    if (!stats)
      return achievementsData.achievements.map((achievement) => ({
        ...achievement,
        unlocked: false,
      }))

    return achievementsData.achievements
      .map((achievement) => ({
        ...achievement,
        unlocked:
          achievement.condition === "true" ? true : eval(achievement.condition),
      }))
      .sort((a, b) => {
        if (a.unlocked === b.unlocked) return 0
        return a.unlocked ? -1 : 1
      })
  }, [stats])

  useEffect(() => {
    if (onAchievementsUpdate) {
      onAchievementsUpdate(achievements)
    }
  }, [achievements, onAchievementsUpdate])

  return (
    <div className='w-full md:max-w-[65%] mx-auto mt-10'>
      <div className='overflow-hidden'>
        <div className='p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'>
          {achievements.map((achievement) => (
            <div key={achievement.id} className='flex flex-col items-center'>
              <div
                className={`group relative flex flex-col items-center justify-center p-3 rounded-full aspect-square border-4 transition-all duration-200 hover:scale-105 hover:border-transparent ${
                  achievement.unlocked
                    ? "bg-white border-primary_muted"
                    : "border-gray-200 bg-gray-50 opacity-50"
                }`}
              >
                <span className='text-3xl'>{achievement.icon}</span>
                <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-full'>
                  <p className='text-xs text-secondary_muted text-center px-3'>
                    {achievement.description}
                  </p>
                </div>
              </div>
              <h3
                className={`text-xs font-medium font-montserrat text-secondary text-center mt-1 ${
                  achievement.unlocked ? "text-primary" : "text-secondary_muted"
                }`}
              >
                {achievement.unlocked ? achievement.title : "🔒"}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
