import { sequelize } from './src/config/database.js';

async function checkSchema() {
    try {
        const [results] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'exam_schedules'");
        console.log('Columns in exam_schedules:', results.map(r => r.column_name));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
