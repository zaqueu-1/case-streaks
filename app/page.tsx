'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
        <p>Se não for redirecionado automaticamente, <a href="/dashboard" className="text-blue-500 hover:underline">clique aqui</a>.</p>
      </div>
    </div>
  );
} 