"use client"

import { useRef } from "react"
import html2canvas from "html2canvas"
import { ShareButtonProps } from "../../types/components"

export default function ShareButton({ stats }: ShareButtonProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleShare = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#FFDF53",
        scale: 2,
      })

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((blob) => resolve(blob!), "image/png"),
      )
      const file = new File([blob], "my-achievements.png", {
        type: "image/png",
      })

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: "Minhas Conquistas no the news",
          text: "Confira meu progresso no the news! 📚✨",
        })
      } else {
        const shareUrl = URL.createObjectURL(blob)
        window.open(shareUrl, "_blank")
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error)
    }
  }

  if (!stats) return null

  return (
    <>
      <button
        onClick={handleShare}
        className='mt-8 w-[200px] mx-auto flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-base font-medium rounded-md text-secondary bg-primary shadow-lg hover:bg-primary_muted transition-all duration-200 ease-in-out focus:outline-none focus:ring-0 focus:ring-offset-0 focus:ring-transparent'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-5 h-5'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z'
          />
        </svg>
        Compartilhar
      </button>

      <div className='fixed left-[-9999px]'>
        <div
          ref={cardRef}
          className='relative w-[1080px] h-[1920px] bg-primary_muted'
        >
          <div className='absolute inset-0 flex flex-col items-center justify-center p-16 rounded-xl'>
            <div className='shadow-lg w-full h-[920px] bg-white rounded-xl flex flex-col items-center justify-between p-16'>
              <div className='text-center p-4 rounded-lg'>
                <div className='text-2xl'>⭐</div>
                <div className='text-xl font-bold text-secondary'>
                  Nível {stats?.level}{" "}
                  <span className='text-xs text-secondary_muted font-light'>
                    {stats?.points} pontos
                  </span>
                </div>
              </div>

              <div className='text-center flex flex-col gap-4'>
                <div className='text-8xl mb-8'>🔥</div>
                <div className='text-7xl font-bold text-secondary'>
                    {stats.currentStreak > 0 ? (
                        <span>
                            Eu alcancei {stats?.currentStreak} {stats?.currentStreak === 1 ? "dia" : "dias"} de leitura!
                        </span>
                    ) : (
                        <span>
                            Eu alcancei o nível {stats?.level}!
                        </span>
                    )}
                </div>
              </div>

              <div className='text-xl text-secondary_muted'>☕ the news</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
