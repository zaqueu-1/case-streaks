"use client"

import { useState, useEffect } from "react"
import { AccessCalendarProps } from "../../types/components"

interface WeekDay {
  key: string
  label: string
}

export default function AccessCalendar({ accesses = [] }: AccessCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (accesses?.length > 0) {
      const mostRecentAccess = new Date(accesses[0].timestamp)
      return new Date(
        mostRecentAccess.getFullYear(),
        mostRecentAccess.getMonth(),
        1,
      )
    }
    return new Date()
  })

  useEffect(() => {
    if (accesses?.length > 0) {
      const mostRecentAccess = new Date(accesses[0].timestamp)
      setCurrentDate(
        new Date(
          mostRecentAccess.getFullYear(),
          mostRecentAccess.getMonth(),
          1,
        ),
      )
    }
  }, [accesses])

  const monthNames = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ]

  const weekDays: WeekDay[] = [
    { key: "dom", label: "D" },
    { key: "seg", label: "S" },
    { key: "ter", label: "T" },
    { key: "qua", label: "Q" },
    { key: "qui", label: "Q" },
    { key: "sex", label: "S" },
    { key: "sab", label: "S" },
  ]

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay()

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    )
  }

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    )
  }

  const isAccessDay = (day: number): boolean => {
    if (!accesses?.length) return false

    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
      12,
    )

    return accesses.some((access) => {
      const accessDate = new Date(access.timestamp)
      const brasiliaDate = new Date(
        accessDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
      )

      return (
        brasiliaDate.getFullYear() === targetDate.getFullYear() &&
        brasiliaDate.getMonth() === targetDate.getMonth() &&
        brasiliaDate.getDate() === targetDate.getDate()
      )
    })
  }

  const renderCalendarDays = () => {
    const blanks = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      blanks.push(
        <div
          key={`blank-${i}`}
          className='p-2 text-center text-gray-300'
        ></div>,
      )
    }

    const days = []
    for (let d = 1; d <= daysInMonth; d++) {
      const isAccess = isAccessDay(d)
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        d,
      )
      const isSunday = date.getDay() === 0

      days.push(
        <div
          key={`day-${d}`}
          className={`px-0 py-2 text-center flex items-center justify-center gap-1 relative ${
            isAccess && !isSunday
              ? "bg-primary shadow-lg border-2 border-solid border-white text-white rounded-lg font-medium hover:scale-105 transition-all duration-300"
              : "text-secondary_muted font-light"
          }`}
        >
          <span>{d}</span>
          {isAccess && !isSunday && <span className='hidden sm:block'>📰</span>}
        </div>,
      )
    }

    return [...blanks, ...days]
  }

  return (
    <div className='w-full md:max-w-[70%] mx-auto bg-primary_muted rounded-lg shadow-lg p-6'>
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={previousMonth}
          className='p-2 text-secondary rounded-full'
        >
          ←
        </button>
        <span className='text-lg font-light text-secondary'>
          {monthNames[currentDate.getMonth()]} de {currentDate.getFullYear()}
        </span>
        <button onClick={nextMonth} className='p-2 text-secondary rounded-full'>
          →
        </button>
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {weekDays.map((day) => (
          <div
            key={day.key}
            className='p-2 text-center font-medium text-secondary text-sm'
          >
            {day.label}
          </div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  )
}
