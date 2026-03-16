import 'dotenv/config';
import { sequelize } from './src/config/database.js';
import './src/bootstrap/models.js';

async function testModels() {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");
    
    // Test if models are loaded
    const models = sequelize.models;
    console.log(`Loaded ${Object.keys(models).length} models.`);
    
    // Check if HR SalaryStructure and SalaryGrade are loaded and associated
    const salaryStructure = models.SalaryStructure;
    if (salaryStructure) {
        console.log("SalaryStructure model loaded");
        console.log("Associations:", Object.keys(salaryStructure.associations));
    }
    
    console.log("Success!");
    process.exit(0);
  } catch (error) {
    console.error("Failed:", error);
    process.exit(1);
  }
}

testModels();
