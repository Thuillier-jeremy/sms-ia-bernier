    // Test simple de la requête
    const testUrl = `${supabaseUrl}/rest/v1/clients?select=count`;
    console.log("🌐 Test URL:", testUrl);
    console.log("🔐 API Key present:", supabaseKey ? "✅" : "❌");
    
    try {
      console.log("🚀 Starting fetch with headers...");
      
      const testRes = await fetch(testUrl, {
        method: "GET",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      });
      
      console.log("✅ Fetch succeeded!");
      console.log("📊 Status:", testRes.status);
      console.log("📋 Headers:", JSON.stringify([...testRes.headers.entries()]));
      
      const text = await testRes.text();
      console.log("📦 Response body:", text.substring(0, 200));
      
    } catch (fetchErr) {
      console.error("❌ FETCH FAILED");
      console.error("🔴 Error name:", fetchErr.name);
      console.error("🔴 Error message:", fetchErr.message);
      console.error("🔴 Error code:", fetchErr.code);
      console.error("🔴 Full error:", JSON.stringify(fetchErr));
      throw fetchErr;
    }