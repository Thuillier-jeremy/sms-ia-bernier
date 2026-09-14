import Anthropic from "@anthropic-ai/sdk";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { message, conversationHistory, apiKeyAnthropic } = JSON.parse(
      event.body
    );

    if (!message || !apiKeyAnthropic) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Message et clé API Anthropic requis",
        }),
      };
    }

    const client = new Anthropic({
      apiKey: apiKeyAnthropic,
    });

    // Construire l'historique pour Claude
    const messages = (conversationHistory || [])
      .filter(
        (msg) => msg.type === "user" || msg.type === "assistant"
      )
      .map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.text,
      }));

    // Ajouter le nouveau message si pas déjà présent
    if (messages[messages.length - 1]?.content !== message) {
      messages.push({
        role: "user",
        content: message,
      });
    }

    const response = await client.messages.create({
      model: "claude-opus-4-1",
      max_tokens: 1024,
      system: `Tu es un assistant SMS amical et professionnel pour une entreprise automobile. 
Tu réponds brièvement et clairement (max 160 caractères pour respecter les limites SMS).
Sois courtois, utile et concis dans tes réponses.
Utilise un ton conversationnel et naturel.`,
      messages: messages,
    });

    const textContent = response.content.find((block) => block.type === "text");

    if (!textContent) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Pas de réponse texte de Claude" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        response: textContent.text,
      }),
    };
  } catch (error) {
    console.error("Erreur Claude API:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || "Erreur lors de la génération de la réponse",
      }),
    };
  }
};
