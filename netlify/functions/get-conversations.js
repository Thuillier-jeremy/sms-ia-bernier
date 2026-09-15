export const handler = async (event) => {
  console.log("📥 get-conversations called");

  try {
    const databaseUrl = process.env.FIREBASE_DATABASE_URL;
    const databaseSecret = process.env.FIREBASE_DATABASE_SECRET;

    if (!databaseUrl || !databaseSecret) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Firebase vars missing" }),
      };
    }

    // Récupérer toutes les conversations
    const firebaseUrl = `${databaseUrl}/conversations.json?auth=${databaseSecret}`;
    
    console.log("🚀 Fetching conversations from Firebase...");
    const response = await fetch(firebaseUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("📊 Firebase Status:", response.status);
    const data = await response.json();

    if (response.ok) {
      console.log("✅ Conversations retrieved!");
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          conversations: data || {},
        }),
      };
    } else {
      throw new Error(`Firebase returned ${response.status}`);
    }
  } catch (error) {
    console.error("💥 Error:", error.message);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};