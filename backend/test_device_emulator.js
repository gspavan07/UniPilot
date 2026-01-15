const API_URL = "http://localhost:3000/api/biometric/sync";
const DEVICE_IP = "192.168.1.50";

const getPayload = () => [
  {
    device_user_id: "101",
    timestamp: new Date().toISOString(),
    device_ip: DEVICE_IP,
  },
];

const runSimulation = async () => {
  console.log("-----------------------------------------");
  console.log("BIOMETRIC DEVICE EMULATOR (Native Fetch)");
  console.log("-----------------------------------------");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getPayload()),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS!");
      console.log("Response:", data);
    } else {
      console.log("❌ FAILED");
      console.log("Status:", response.status);
      console.log("Data:", data);
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
};

runSimulation();
