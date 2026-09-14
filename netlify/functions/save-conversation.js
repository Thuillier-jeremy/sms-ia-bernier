import { createClient } from "@supabase/supabase-js";

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

    // Récupérer les variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    console.log("🔐 Checking env vars:");
    console.log("  URL:", supabaseUrl ? "✅" : "❌");
    console.log("  KEY:", supabaseKey ? "✅" : "❌");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Variables Supabase manquantes");
    }

    if (!phoneNumber || !messages) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "phoneNumber et messages requis" }),
      };
    }

    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Supabase client créé");

    // 1. Trouver ou créer le client
    console.log("🔍 Searching client...");
    let { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("phone_number", phoneNumber)
      .single();

    if (clientError && clientError.code !== "PGRST116") {
      throw clientError;
    }

    if (!client) {
      console.log("➕ Creating new client...");
      const { data: newClient, error: createError } = await supabase
        .from("clients")
        .insert({ phone_number: phoneNumber })
        .select("id")
        .single();

      if (createError) throw createError;
      client = newClient;
      console.log(`✅ Nouveau client créé: ${client.id}`);
    } else {
      console.log(`✅ Client trouvé: ${client.id}`);
    }

    // 2. Créer ou mettre à jour la conversation
    console.log("🔍 Searching conversation...");
    let { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id")
      .eq("client_id", client.id)
      .eq("phone_number", phoneNumber)
      .single();

    if (convError && convError.code !== "PGRST116") {
      throw convError;
    }

    if (!conversation) {
      console.log("➕ Creating new conversation...");
      const { data: newConv, error: newConvError } = await supabase
        .from("conversations")
        .insert({
          client_id: client.id,
          phone_number: phoneNumber,
        })
        .select("id")
        .single();

      if (newConvError) throw newConvError;
      conversation = newConv;
      console.log(`✅ Nouvelle conversation créée: ${conversation.id}`);
    } else {
      console.log(`✅ Conversation trouvée: ${conversation.id}`);
    }

    // 3. Sauvegarder les messages
    console.log(`📝 Saving ${messages.length} messages...`);
    const messagesToInsert = messages.map((msg) => ({
      conversation_id: conversation.id,
      direction: msg.type === "user" ? "inbound" : "outbound",
      text: msg.text,
      sender: msg.type === "user" ? "user" : "claude",
    }));

    const { error: messagesError } = await supabase
      .from("messages")
      .insert(messagesToInsert);

    if (messagesError) throw messagesError;

    console.log(`✅ ${messages.length} messages sauvegardés`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        conversationId: conversation.id,
        clientId: client.id,
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