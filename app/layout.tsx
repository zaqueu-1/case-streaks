import "./globals.css"
import Providers from "./providers"
import Script from "next/script"
import Header from "./components/Header"
import "./healthcheck"
import { ReactNode } from "react"

export const metadata = {
  title: "the news - dashboard",
  description: "Acompanhe seu streak em nossa newsletter!",
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang='pt-BR'>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <link
          href='https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap'
          rel='stylesheet'
        />
      </head>
      <body className='font-poppins bg-[#F9FAFB]' suppressHydrationWarning>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
        <Script
          src='/_next/static/chunks/main-app.js'
          strategy='afterInteractive'
        />
      </body>
    </html>
  )
}
