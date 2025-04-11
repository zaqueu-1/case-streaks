export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl mb-8">Página não encontrada</h2>
        <a 
          href="/dashboard" 
          className="inline-block px-6 py-3 rounded-md bg-primary text-secondary font-medium"
        >
          Voltar para o Dashboard
        </a>
      </div>
    </div>
  )
} 