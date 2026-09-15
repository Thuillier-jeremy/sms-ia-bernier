export const handler = async (event) => {
  console.log("🚨 WEBHOOK APPELÉ !");
  console.log("📥 Body:", event.body);
  console.log("📥 Headers:", event.headers);
  
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // M-Target envoie en form-urlencoded
    const params = new URLSearchParams(event.body);
    
    const phoneNumber = params.get('Msisdn') || '';
    const message = params.get('Content') || '';
    
    console.log(`📱 SMS de ${phoneNumber}: ${message}`);

    if (!phoneNumber || !message) {
      console.log("⚠️ Missing phone or message");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing phoneNumber or message" }),
      };
    }

    // Envoyer à Claude IA
    console.log("🤖 Envoi à Claude...");
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.VITE_ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: "claude-opus-5",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const claudeData = await claudeResponse.json();
    const aiResponse = claudeData.content?.[0]?.text || "Erreur Claude";

    console.log("✅ Réponse Claude:", aiResponse);

    // Envoyer la réponse par SMS via M-Target
    console.log("📤 Envoi SMS de réponse...");
    const smsUrl = `${process.env.VITE_MTARGET_API_URL}?username=${process.env.MTARGET_USERNAME}&password=${process.env.MTARGET_PASSWORD}&msisdn=${phoneNumber}&msg=${encodeURIComponent(aiResponse)}&serviceid=${process.env.VITE_MTARGET_SERVICE_ID}&sender=${process.env.VITE_MTARGET_SENDER_PROFILE}`;

    const smsResponse = await fetch(smsUrl);
    console.log("✅ SMS envoyé");

    // Sauvegarder dans Firebase
    console.log("💾 Sauvegarde Firebase...");
    const databaseUrl = process.env.FIREBASE_DATABASE_URL;
    const databaseSecret = process.env.FIREBASE_DATABASE_SECRET;

    const timestamp = Date.now();
    const conversationPath = `conversations/${phoneNumber}/${timestamp}`;
    const firebaseUrl = `${databaseUrl}/${conversationPath}.json?auth=${databaseSecret}`;

    const firebaseData = {
      phoneNumber,
      messages: [
        {
          type: "user",
          text: message,
          timestamp: new Date().toISOString(),
        },
        {
          type: "assistant",
          text: aiResponse,
          timestamp: new Date().toISOString(),
        },
      ],
      messageCount: 2,
      timestamp,
    };

    await fetch(firebaseUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firebaseData),
    });

    console.log("✅ Firebase saved");

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "SMS processed",
        response: aiResponse,
      }),
    };
  } catch (error) {
    console.error("💥 Webhook error:", error.message);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};