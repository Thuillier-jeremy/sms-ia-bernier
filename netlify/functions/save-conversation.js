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

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    console.log("🔐 URL check:", supabaseUrl ? "✅" : "❌ MISSING");
    console.log("🔐 KEY check:", supabaseKey ? "✅" : "❌ MISSING");

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Supabase vars missing" }),
      };
    }

    // Test simple de la requête
    const testUrl = `${supabaseUrl}/rest/v1/clients?select=count`;
    console.log("🌐 Test URL:", testUrl);
    
    try {
      console.log("🚀 Starting fetch...");
      const testRes = await fetch(testUrl, {
        headers: {
          "apikey": supabaseKey,
        },
      });
      console.log("✅ Fetch succeeded, status:", testRes.status);
    } catch (fetchErr) {
      console.error("❌ Fetch error:", fetchErr.message);
      throw fetchErr;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Test OK" }),
    };
  } catch (error) {
    console.error("💥 Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};