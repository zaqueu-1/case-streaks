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
  DATABASE_URL: "mock_database_url",
  NEXTAUTH_SECRET: "mock_secret",
  NEXTAUTH_URL: "http://localhost:3000",
}
