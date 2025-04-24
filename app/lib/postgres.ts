import pkg from "pg"
const { Pool } = pkg

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está definida")
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Query executada:", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Erro ao executar query:", error)
    throw error
  }
}

export async function withTransaction<T>(
  callback: (client: pkg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export default pool
