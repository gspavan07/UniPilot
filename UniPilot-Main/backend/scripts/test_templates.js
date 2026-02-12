const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const EMAIL = 'admin@unipilot.com';
const PASSWORD = 'password123';

async function testTemplates() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.token;
        console.log('Logged in. Token acquired.');

        const headers = { Authorization: `Bearer ${token}` };

        console.log('\n2. Listing initial templates...');
        const initialListRes = await axios.get(`${API_URL}/question-paper-templates`, { headers });
        console.log('Templates found:', initialListRes.data.data.length);

        console.log('\n3. Creating a test template...');
        // Need a valid course_id and program_id. Let's fetch courses and programs first or assume/find some.
        // Actually, let's just use dummy UUIDs if the backend doesn't strictly enforce foreign key constraints on the DB level without existing records (it probably does).
        // So we need valid IDs.
        // Let's fetch one course and use its ID.

        const coursesRes = await axios.get(`${API_URL}/courses`, { headers });
        if (coursesRes.data.data.rows.length === 0) {
            console.error('No courses found to test with.');
            return;
        }
        const course = coursesRes.data.data.rows[0];
        console.log(`Using Course: ${course.name} (${course.id})`);

        const payload = {
            course_id: course.id,
            questions: [
                { q_no: "Q1", marks: 10, co_id: "dummy-co-id" } // CO ID might not be validated strictly in template, or we need one.
            ],
            total_marks: 10
        };

        const createRes = await axios.post(`${API_URL}/question-paper-templates`, payload, { headers });
        console.log('Template created. ID:', createRes.data.data.id);
        const newTemplateId = createRes.data.data.id;

        console.log('\n4. Listing templates again...');
        const midListRes = await axios.get(`${API_URL}/question-paper-templates`, { headers });
        console.log('Templates found:', midListRes.data.data.length);
        const found = midListRes.data.data.find(t => t.id === newTemplateId);
        if (found) {
            console.log('✅ Specific template found in list.');
        } else {
            console.error('❌ Template NOT found in list.');
        }

        console.log('\n5. Deleting the test template...');
        await axios.delete(`${API_URL}/question-paper-templates/${newTemplateId}`, { headers });
        console.log('Template deleted.');

        console.log('\n6. Listing templates final check...');
        const finalListRes = await axios.get(`${API_URL}/question-paper-templates`, { headers });
        console.log('Templates found:', finalListRes.data.data.length);
        const foundAfter = finalListRes.data.data.find(t => t.id === newTemplateId);
        if (!foundAfter) {
            console.log('✅ Template successfully removed from list.');
        } else {
            console.error('❌ Template STILL found in list.');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testTemplates();
