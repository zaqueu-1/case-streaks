// Limpa todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks()
})

// Silencia warnings do console durante os testes
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock do objeto process.env
process.env = {
  ...process.env,
  NEXTAUTH_SECRET: "mock_secret",
  NEXTAUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "https://mock-supabase-url.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "mock-anon-key",
}
