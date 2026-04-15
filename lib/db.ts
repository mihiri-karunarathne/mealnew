import postgres from 'postgres'

// Lazy singleton
let cachedDb: ReturnType<typeof postgres> | null = null

export function getDb(): ReturnType<typeof postgres> {
  console.log('🔍 getDb() called') // Debug
  console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ MISSING') // Debug
 
  if (!cachedDb) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
       console.error('💥 DATABASE_URL:', process.env.DATABASE_URL) // Full value
      throw new Error('DATABASE_URL is missing from .env.local')
    }
    console.log('🔗 Connecting to:', connectionString.split('@')[1] || 'hidden') // Partial URL
    cachedDb = postgres(connectionString, {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10,
    })
  }
  return cachedDb
}