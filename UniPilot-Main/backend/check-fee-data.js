import { sequelize, FeeStructure, User, AcademicFeePayment, StudentChargePayment } from './src/models/index.js';

async function checkData() {
    try {
        console.log('=== Checking Fee Data ===\n');

        // Check total fee structures
        const totalStructures = await FeeStructure.count({
            where: { is_active: true, student_id: null }
        });
        console.log('Total Active Fee Structures:', totalStructures);

        // Check test user
        const user = await User.findOne({
            where: { email: 'dev.pavangollapalli@gmail.com' },
            attributes: ['id', 'email', 'program_id', 'batch_year', 'current_semester']
        });

        if (!user) {
            console.log('\n❌ Test user not found!');
            process.exit(1);
        }

        console.log('\n✓ Test User Found:');
        console.log('  Email:', user.email);
        console.log('  ID:', user.id);
        console.log('  Program ID:', user.program_id);
        console.log('  Batch Year:', user.batch_year);
        console.log('  Current Semester:', user.current_semester);

        const effectiveBatchYear = user.batch_year || new Date().getFullYear();

        // Check fee structures for this user's program and batch
        const userFeeStructures = await FeeStructure.findAll({
            where: {
                program_id: user.program_id,
                batch_year: effectiveBatchYear,
                is_active: true,
                student_id: null
            },
            limit: 5
        });

        console.log('\n✓ Fee Structures for User (Program:', user.program_id, ', Batch:', effectiveBatchYear, '):', userFeeStructures.length);

        if (userFeeStructures.length > 0) {
            console.log('\nSample Fee Structures:');
            userFeeStructures.forEach((s, i) => {
                console.log(`  ${i + 1}. Semester ${s.semester}, Amount: ${s.amount}, Category ID: ${s.category_id}`);
            });
        }

        // Check academic payments
        const academicPayments = await AcademicFeePayment.count({
            where: { student_id: user.id }
        });
        console.log('\nAcademic Fee Payments:', academicPayments);

        // Check charge payments
        const chargePayments = await StudentChargePayment.count({
            where: { student_id: user.id }
        });
        console.log('Student Charge Payments:', chargePayments);

        console.log('\n=== Analysis ===');
        if (userFeeStructures.length === 0) {
            console.log('⚠️  No fee structures found for this program/batch combination!');
            console.log('    This explains why the fee ledger is empty.');
            console.log('    You need to create fee structures for:');
            console.log('      Program ID:', user.program_id);
            console.log('      Batch Year:', effectiveBatchYear);
        } else {
            console.log('✓ Fee structures exist - the API should return data.');
        }

        await sequelize.close();
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

checkData();
