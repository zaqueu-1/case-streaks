import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-secondary">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Página não encontrada</p>
      <Link
        href="/"
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary_hover transition-colors"
      >
        Voltar para a página inicial
      </Link>
    </div>
  )
} 