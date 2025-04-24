"use client"

import { useState, FormEvent } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.ok) {
        router.replace("/dashboard")
        return
      }

      setError("Erro desconhecido no login")
    } catch (error) {
      setError("Ocorreu um erro ao fazer login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-background flex flex-col justify-center py-8 sm:px-6 lg:px-8'>
      <div className='px-4 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='flex justify-center'>
          <div className='w-20 h-20 relative mb-4'>
            <Image
              src='https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/publication/logo/ce78b549-5923-439b-be24-3f24c454bc12/ICONE_the_news_com_AMARELO.png'
              alt='the news'
              width={80}
              height={80}
              className='drop-shadow-lg'
            />
          </div>
        </div>
        <h2 className='mt-1 text-center text-5xl font-bold font-verdana text-secondary'>
          the news
        </h2>
        <p className='mt-2 text-center text-sm font-poppins text-secondary'>
          tudo que você precisa saber pra começar seu dia bem e informado.
        </p>
      </div>

      <div className='mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            <div>
              <div className='mt-1 relative rounded-lg border-2 border-primary overflow-hidden'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-5 h-5 text-primary'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75'
                    />
                  </svg>
                </div>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder='insira seu e-mail'
                  className='block w-full pl-10 pr-3 py-3 border-none bg-background text-secondary placeholder-gray-400 focus:outline-none text-lg font-verdana disabled:bg-gray-100 disabled:cursor-not-allowed'
                />
              </div>
            </div>

            {error && (
              <div className='rounded-md bg-red-50 p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-5 w-5 text-red-400'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <h3 className='text-sm font-medium text-red-800'>
                      Erro no login
                    </h3>
                    <div className='mt-2 text-sm text-red-700'>{error}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type='submit'
                disabled={loading || !email}
                className='w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-montserrat font-semibold text-secondary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/70 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <>
                    <div className='animate-spin -ml-1 mr-3 h-5 w-5 text-secondary'>
                      ⏳
                    </div>
                    entrando...
                  </>
                ) : (
                  "login"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
