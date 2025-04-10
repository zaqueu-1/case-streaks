'use client'

import { useEffect } from 'react'
import { setupCronJobs } from '@/app/lib/cron'

/**
 * Componente que inicializa os cron jobs apenas em ambiente de desenvolvimento
 * Na Vercel, usamos os Vercel Cron Jobs configurados em vercel.json
 */
export default function CronInitializer() {
  useEffect(() => {
    // Em desenvolvimento, configura os cron jobs
    // Em produção na Vercel, eles são gerenciados pela plataforma
    setupCronJobs()
  }, [])

  return null
} 