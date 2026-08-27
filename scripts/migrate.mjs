import { neon } from '@neondatabase/serverless';

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_luew6niNLh7k@ep-hidden-darkness-a1mgznkm-pooler.ap-southeast-1.aws.neon.tech/MenuJoshua?sslmode=require&channel_binding=require';

const sql = neon(databaseUrl);

async function migrate() {
  console.log('Connecting to Neon PostgreSQL and migrating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS restaurants (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      note TEXT,
      is_favorite BOOLEAN DEFAULT FALSE,
      eaten BOOLEAN DEFAULT FALSE,
      eaten_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  console.log('✓ Table "restaurants" created or already exists!');

  // Check count
  const rows = await sql`SELECT count(*) as count FROM restaurants;`;
  console.log(`✓ Current restaurant count in DB: ${rows[0].count}`);

  console.log('Migration completed successfully.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
