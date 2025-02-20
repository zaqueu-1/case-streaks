"use client"

import Image from "next/image"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  if (pathname === "/login") return null

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut({
        redirect: false,
        callbackUrl: "/login",
      })
      router.replace("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <nav className='px-4 sm:px-6 w-full py-2 bg-white'>
      <div className='mx-auto w-full max-w-6xl'>
        <div className='mx-auto flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Link
              href='/'
              className='rounded-lg transition-all px-2 py-1 hover:bg-black/5'
            >
              <div className='flex items-center space-x-2'>
                <div className='h-8 w-8 overflow-hidden rounded-lg'>
                  <figure className='aspect-square relative h-full overflow-hidden w-full'>
                    <Image
                      className='absolute inset-0 h-full w-full object-cover'
                      width={100}
                      height={100}
                      src='https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/publication/logo/ce78b549-5923-439b-be24-3f24c454bc12/thumb_ICONE_the_news_com_AMARELO.png'
                      alt='the news logo'
                    />
                  </figure>
                </div>
                <span className='sm:text-md hidden text-sm md:block text-md font-montserrat text-secondary'>
                  the news
                </span>
              </div>
            </Link>
            <div className='block'>
              <div className='z-20 flex gap-1'>
                <a
                  className='transition-all rounded-lg px-2 py-2 hover:bg-black/5'
                  href='https://thenewscc.typeform.com/to/twCcjRbQ'
                  target='_blank'
                  rel='nofollow noreferrer noopener'
                >
                  <span className='whitespace-nowrap text-xs sm:block text-md font-montserrat text-secondary'>
                    anuncie no the news
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <div className='flex items-center space-x-2'>
              <button
                onClick={handleSignOut}
                disabled={isLoading || status === "loading"}
                className='border inline-flex items-center justify-center transition-colors rounded-lg px-4 py-2 text-sm border-primary bg-primary text-secondary font-poppins font-semibold shadow-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin -ml-1 mr-3 h-4 w-4 text-secondary'>
                      ⏳
                    </div>
                    Saindo...
                  </>
                ) : (
                  "Sair"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
