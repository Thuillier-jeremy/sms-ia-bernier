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
    const supabaseKey = process.env.SUPABASE_ANON_JWT;

    console.log("🔐 URL check:", supabaseUrl ? "✅" : "❌");
    console.log("🔐 KEY check:", supabaseKey ? "✅" : "❌");

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Supabase vars missing" }),
      };
    }

    if (!phoneNumber || !messages) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "phoneNumber et messages requis" }),
      };
    }

    // Test simple
    const testUrl = `${supabaseUrl}/rest/v1/clients?select=count`;
    console.log("🌐 Test URL:", testUrl);
    
    console.log("🚀 Starting fetch...");
    const testRes = await fetch(testUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
    });
    
    console.log("✅ Fetch succeeded!");
    console.log("📊 Status:", testRes.status);
    
    const text = await testRes.text();
    console.log("📦 Response:", text.substring(0, 200));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Test OK" }),
    };
    
  } catch (error) {
    console.error("💥 Error:", error.message);
    console.error("🔴 Full error:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};