import { redirect } from "next/navigation"

export const metadata = {
  title: 'Case Streaks',
  description: 'Acompanhe suas streaks e métricas de acesso'
}

export default function Home() {
  // Garantir que temos um caminho seguro para redirecionar
  try {
    return redirect("/dashboard")
  } catch (error) {
    // Fallback para o caso de problemas durante o redirecionamento
    return (
      <div>
        <h1>Redirecionando...</h1>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.href = "/dashboard";`,
          }}
        />
      </div>
    )
  }
} 