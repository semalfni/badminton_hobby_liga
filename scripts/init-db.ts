import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Read and execute schema.sql
    const schemaPath = join(__dirname, '../schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await sql.query(statement);
      } catch (error: any) {
        // Log but continue for errors like "relation already exists"
        if (!error.message?.includes('already exists')) {
          console.error('Error executing statement:', error.message);
        }
      }
    }
    
    console.log('✅ Database schema initialized');
    
    // Check if admin user exists
    const adminCheck = await sql`
      SELECT id FROM users WHERE username = 'admin' LIMIT 1
    `;
    
    if (adminCheck.rows.length === 0) {
      // Create default admin user
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      await sql`
        INSERT INTO users (username, password, role)
        VALUES ('admin', ${hashedPassword}, 'admin')
      `;
      console.log('✅ Default admin user created (username: admin, password: admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Check if observer user exists
    const observerCheck = await sql`
      SELECT id FROM users WHERE username = 'guest' LIMIT 1
    `;
    
    if (observerCheck.rows.length === 0) {
      // Create default observer user
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('guest', 10);
      await sql`
        INSERT INTO users (username, password, role)
        VALUES ('guest', ${hashedPassword}, 'observer')
      `;
      console.log('✅ Default observer user created (username: guest, password: guest)');
    } else {
      console.log('✅ Observer user already exists');
    }
    
    console.log('🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
