export const handler = async (event) => {
  // Accepter uniquement POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const payload = JSON.parse(event.body);

    console.log("SMS reçu via webhook:", {
      from: payload.from || payload.phone,
      message: payload.message || payload.text,
      timestamp: payload.timestamp,
      messageId: payload.id || payload.message_id,
    });

    // Optionnel: Vérifier la signature du webhook (si M-Target le supporte)
    // const signature = event.headers['x-mtarget-signature'];
    // if (!verifySignature(signature, event.body)) {
    //   return { statusCode: 401, body: JSON.stringify({ error: "Invalid signature" }) };
    // }

    // Ici vous pouvez:
    // 1. Sauvegarder le SMS dans une base de données
    // 2. Déclencher une réponse automatique
    // 3. Notifier l'interface en temps réel via WebSocket/SSE

    // Pour le moment, on retourne un 200 pour confirmer la réception
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "SMS reçu avec succès",
      }),
    };
  } catch (error) {
    console.error("Erreur webhook SMS:", error);

    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
