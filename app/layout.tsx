import { Montserrat, Poppins } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import Script from "next/script"
import Header from "./components/Header"
import "./healthcheck"
import { ReactNode } from "react"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

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
      <body
        className={`${montserrat.variable} ${poppins.variable} font-poppins bg-[#F9FAFB]`}
        suppressHydrationWarning
      >
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
