import Link from 'next/link';

export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl mb-8">Página não encontrada</h2>
        <Link 
          href="/dashboard" 
          className="inline-block px-6 py-3 rounded-md bg-primary text-secondary font-medium"
        >
          Voltar para o Dashboard
        </Link>
      </div>
    </div>
  );
} 