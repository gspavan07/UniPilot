import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('unipilot', 'postgres', 'postgres', {
    host: '100.116.183.49',
    port: 5432,
    dialect: 'postgres',
    logging: false
});

async function fixComponentBreakdown() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database');

        const [results, metadata] = await sequelize.query(`
      UPDATE exam_cycles 
      SET component_breakdown = '[
        {"name": "Day-to-Day Performance", "max_marks": 15},
        {"name": "Lab Record", "max_marks": 10},
        {"name": "Internal Lab Test/Viva", "max_marks": 25}
      ]'::jsonb
      WHERE id = '63cc09c5-e927-44e4-bd92-18237b36d472'
      RETURNING id, name, component_breakdown;
    `);

        console.log('✅ Successfully updated component_breakdown');
        console.log('Updated cycle:', results[0]);

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixComponentBreakdown();
