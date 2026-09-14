import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { phoneNumber, messages } = JSON.parse(event.body);

    if (!phoneNumber || !messages) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "phoneNumber et messages requis" }),
      };
    }

    console.log(`💾 Sauvegarde conversation pour ${phoneNumber}`);

    // 1. Trouver ou créer le client
    let { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("phone_number", phoneNumber)
      .single();

    if (clientError && clientError.code !== "PGRST116") {
      throw clientError;
    }

    if (!client) {
      const { data: newClient, error: createError } = await supabase
        .from("clients")
        .insert({ phone_number: phoneNumber })
        .select("id")
        .single();

      if (createError) throw createError;
      client = newClient;
      console.log(`✅ Nouveau client créé: ${client.id}`);
    }

    // 2. Créer ou mettre à jour la conversation
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
    }

    // 3. Sauvegarder les messages
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

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};