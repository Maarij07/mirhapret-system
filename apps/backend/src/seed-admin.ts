/**
 * Run once to create the admin user:
 *   npx ts-node -r tsconfig-paths/register src/seed-admin.ts
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ecommerce_db',
    synchronize: false,
    logging: false,
  });

  await ds.initialize();

  const email = 'admin@mirhapre.tcom';
  const existing = await ds.query(`SELECT id FROM users WHERE email = $1`, [email]);

  if (existing.length > 0) {
    console.log(`Admin user already exists (${email}). Nothing to do.`);
    await ds.destroy();
    return;
  }

  const hash = await bcrypt.hash('(Mirha123)', 10);
  await ds.query(
    `INSERT INTO users (id, email, password, first_name, last_name, role, is_active)
     VALUES (gen_random_uuid(), $1, $2, 'Mirha', 'Admin', 'super_admin', true)`,
    [email, hash],
  );

  console.log(`✓ Admin user created: ${email}`);
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
