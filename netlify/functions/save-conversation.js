export const handler = async (event) => {
  console.log("📥 save-conversation called");
  
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { phoneNumber, messages } = JSON.parse(event.body);
    console.log(`💾 Sauvegarde conversation pour ${phoneNumber}`);

    const databaseUrl = process.env.FIREBASE_DATABASE_URL;
    const databaseSecret = process.env.FIREBASE_DATABASE_SECRET;

    console.log("🔐 Database URL check:", databaseUrl ? "✅" : "❌");
    console.log("🔐 Database Secret check:", databaseSecret ? "✅" : "❌");

    if (!databaseUrl || !databaseSecret) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Firebase vars missing" }),
      };
    }

    if (!phoneNumber || !messages) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "phoneNumber et messages requis" }),
      };
    }

    // Créer l'URL Firebase pour sauvegarder
    const timestamp = Date.now();
    const conversationPath = `conversations/${phoneNumber}/${timestamp}`;
    const firebaseUrl = `${databaseUrl}/${conversationPath}.json?auth=${databaseSecret}`;

    console.log("🌐 Firebase URL:", firebaseUrl.substring(0, 80) + "...");
    console.log("🚀 Starting Firebase save...");

    // Préparer les données
    const firebaseData = {
      phoneNumber,
      messages,
      timestamp,
      messageCount: messages.length,
    };

    const response = await fetch(firebaseUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(firebaseData),
    });

    console.log("📊 Firebase Status:", response.status);
    const responseText = await response.text();
    console.log("📦 Firebase Response:", responseText.substring(0, 200));

    if (response.ok) {
      console.log("✅ Conversation sauvegardée dans Firebase !");
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: "Conversation sauvegardée",
          path: conversationPath,
        }),
      };
    } else {
      throw new Error(`Firebase returned ${response.status}`);
    }
  } catch (error) {
    console.error("💥 Error:", error.message);
    console.error("🔴 Full error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};