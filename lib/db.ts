import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not defined in environment variables.');
}

const sql = neon(process.env.DATABASE_URL || '');

export default sql;
export { sql };
