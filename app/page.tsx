export const metadata = {
  title: 'Case Streaks',
  description: 'Acompanhe suas streaks e métricas de acesso'
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Redirecionando...</h1>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = "/dashboard";`,
        }}
      />
    </div>
  )
} 