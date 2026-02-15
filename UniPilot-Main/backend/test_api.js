require("dotenv").config();
const axios = require("axios");

async function testApi() {
  const cycleId = "57d05886-7859-4a09-b886-058a13d52473"; // From my check_db_raw.js output
  const apiUrl = `http://localhost:${process.env.PORT || 3000}/api/exam/cycles/${cycleId}`;

  try {
    console.log(`Testing API: ${apiUrl}`);
    // We need a token if there is auth
    // For now, let's try to find how a token is generated or if we can bypass
    // Alternatively, I can just call the controller function manually in a script

    const {
      getCycleById,
    } = require("./src/controllers/exam/examCycleController");
    const mockReq = { params: { id: cycleId } };
    const mockRes = {
      json: (data) =>
        console.log(
          "API Success Response Sample:",
          JSON.stringify(data.data, null, 2),
        ),
      status: (code) => ({
        json: (data) => console.log(`API Error ${code}:`, data),
      }),
    };

    await getCycleById(mockReq, mockRes);
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit();
  }
}

testApi();
