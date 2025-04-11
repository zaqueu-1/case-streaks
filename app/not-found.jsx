export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        404 - Página não encontrada
      </h1>
      <p style={{ marginBottom: '2rem' }}>
        A página que você está procurando não existe.
      </p>
      <a 
        href="/dashboard" 
        style={{
          padding: '10px 20px',
          backgroundColor: '#FFDF53',
          color: '#000',
          textDecoration: 'none',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        Voltar para o Dashboard
      </a>
    </div>
  );
} 