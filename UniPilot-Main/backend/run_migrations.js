import 'dotenv/config';
import { sequelize } from './src/config/database.js';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");
    
    // We run the migrations sequentially to respect FK dependencies
    const migrationsDir = './src/database/migrations';
    
    // Hardcoded migration files we just created
    const migrations = [
      '20260316113516-create-student-profiles.cjs',
      '20260316113517-create-staff-profiles.cjs',
      '20260316113518-migrate-user-data-to-profiles.cjs'
    ];
    
    for (const file of migrations.slice().reverse()) {
      console.log(`Checking rollback for: ${file}...`);
      const migrationPath = path.resolve(migrationsDir, file);
      const migration = (await import(migrationPath)).default || await import(migrationPath);
      const queryInterface = sequelize.getQueryInterface();
      const DataTypes = sequelize.Sequelize;
      try {
        await migration.down(queryInterface, DataTypes);
        console.log(`Successfully rolled back: ${file}`);
      } catch (err) {
        console.log(`Rollback skipped/failed for ${file}: ${err.message}`);
      }
    }
    
    for (const file of migrations) {
      console.log(`Executing migration: ${file}...`);
      const migrationPath = path.resolve(migrationsDir, file);
      const migration = (await import(migrationPath)).default || await import(migrationPath);
      
      const queryInterface = sequelize.getQueryInterface();
      const DataTypes = sequelize.Sequelize;
      
      await migration.up(queryInterface, DataTypes);
      console.log(`Successfully completed migration: ${file}`);
    }
    
    console.log("All migrations ran successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
