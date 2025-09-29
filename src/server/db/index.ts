import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection with proper error handling
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql);
