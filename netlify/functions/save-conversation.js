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

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Variables Supabase manquantes");
    }

    if (!phoneNumber || !messages) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "phoneNumber et messages requis" }),
      };
    }

    // 1. Chercher le client
    console.log("🔍 Searching client...");
    let clientId;
    
    const clientRes = await fetch(
      `${supabaseUrl}/rest/v1/clients?phone_number=eq.${phoneNumber}&select=id`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    const clients = await clientRes.json();
    console.log("Clients response:", clients);

    if (Array.isArray(clients) && clients.length > 0) {
      clientId = clients[0].id;
      console.log(`✅ Client trouvé: ${clientId}`);
    } else {
      // Créer un nouveau client
      console.log("➕ Creating new client...");
      const createRes = await fetch(`${supabaseUrl}/rest/v1/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      const newClient = await createRes.json();
      clientId = newClient[0].id;
      console.log(`✅ Client créé: ${clientId}`);
    }

    // 2. Chercher la conversation
    console.log("🔍 Searching conversation...");
    const convRes = await fetch(
      `${supabaseUrl}/rest/v1/conversations?client_id=eq.${clientId}&phone_number=eq.${phoneNumber}&select=id`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    const conversations = await convRes.json();
    let conversationId;

    if (Array.isArray(conversations) && conversations.length > 0) {
      conversationId = conversations[0].id;
      console.log(`✅ Conversation trouvée: ${conversationId}`);
    } else {
      // Créer une nouvelle conversation
      console.log("➕ Creating new conversation...");
      const createConvRes = await fetch(`${supabaseUrl}/rest/v1/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          client_id: clientId,
          phone_number: phoneNumber,
        }),
      });

      const newConv = await createConvRes.json();
      conversationId = newConv[0].id;
      console.log(`✅ Conversation créée: ${conversationId}`);
    }

    // 3. Sauvegarder les messages
    console.log(`📝 Saving ${messages.length} messages...`);
    const messagesToInsert = messages.map((msg) => ({
      conversation_id: conversationId,
      direction: msg.type === "user" ? "inbound" : "outbound",
      text: msg.text,
      sender: msg.type === "user" ? "user" : "claude",
    }));

    const saveRes = await fetch(`${supabaseUrl}/rest/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(messagesToInsert),
    });

    console.log(`✅ ${messages.length} messages sauvegardés`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        conversationId: conversationId,
        clientId: clientId,
      }),
    };
  } catch (error) {
    console.error("💥 Erreur save-conversation:", error.message);
    console.error("Stack:", error.stack);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};