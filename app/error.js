'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    // Log do erro para análise
    console.error('Erro na aplicação:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Erro</h1>
        <h2 className="text-2xl mb-8">Algo deu errado</h2>
        <button
          onClick={() => reset()}
          className="inline-block px-6 py-3 rounded-md bg-primary text-secondary font-medium"
        >
          Tentar novamente
        </button>
        <div className="mt-6">
          <a 
            href="/dashboard" 
            className="inline-block px-6 py-3 rounded-md bg-gray-200 text-gray-700 font-medium"
          >
            Voltar para o Dashboard
          </a>
        </div>
      </div>
    </div>
  );
} 