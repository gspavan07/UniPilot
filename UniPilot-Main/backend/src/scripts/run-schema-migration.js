/**
 * One-off migration runner for Phase 4: per-module schemas.
 * Run: node src/scripts/run-schema-migration.js
 */
import 'dotenv/config';
import { sequelize } from '../config/database.js';
import migration from '../migrations/20260316-create-module-schemas.js';

async function run() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected.\n');

    console.log('Running migration: 20260316-create-module-schemas...');
    await migration.up(sequelize.getQueryInterface());
    console.log('\n✅ Migration completed successfully!');

    // Verify schemas were created
    const [schemas] = await sequelize.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast') ORDER BY schema_name;`
    );
    console.log('\nSchemas in database:');
    schemas.forEach(s => console.log(`  - ${s.schema_name}`));

    // Check a sample table to verify it moved
    const [tables] = await sequelize.query(
      `SELECT schemaname, tablename FROM pg_tables WHERE tablename = 'users';`
    );
    console.log(`\n"users" table location: ${tables[0]?.schemaname || 'NOT FOUND'}.${tables[0]?.tablename || ''}`);

    await sequelize.close();
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

run();
