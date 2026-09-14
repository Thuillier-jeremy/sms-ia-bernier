export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    let { phoneNumber, text } = JSON.parse(event.body);

// Si le message est vide ou trop court, ajouter du contenu
if (!text || text.trim().length < 15) {
  text = "Bonjour, ceci est un message de test depuis votre assistant SMS. Cordialement, Aero91.";
}

    // Récupérer les variables d'environnement (OBLIGATOIRES)
    const username = process.env.MTARGET_USERNAME;
    const password = process.env.MTARGET_PASSWORD;
    const serviceId = process.env.VITE_MTARGET_SERVICE_ID;
    const sender = process.env.VITE_MTARGET_SENDER_PROFILE;
    const apiUrl = process.env.VITE_MTARGET_API_URL;

    // Vérifier que tout est configuré
    if (!username || !password || !serviceId || !sender || !apiUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Variables d'environnement M-Target manquantes",
        }),
      };
    }

    if (!phoneNumber || !text) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "phoneNumber et text requis",
        }),
      };
    }

    // Formater le numéro
    let msisdn = phoneNumber.replace(/\D/g, "");
    if (msisdn.startsWith("0")) {
      msisdn = "33" + msisdn.substring(1);
    }

    console.log(`Envoi SMS à ${msisdn}`);

    // Construire l'URL avec les paramètres
    const url = new URL(apiUrl);
    url.searchParams.append("username", username);
    url.searchParams.append("password", password);
    url.searchParams.append("msisdn", msisdn);
    url.searchParams.append("msg", text);
    url.searchParams.append("serviceid", serviceId);
    url.searchParams.append("sender", sender);

    // Faire la requête GET
    const response = await fetch(url.toString());
    const data = await response.json();

    console.log("M-Target response:", data);

    if (response.status !== 200) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          success: false,
          error: `Erreur M-Target ${response.status}`,
          details: data,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "SMS envoyé",
        response: data,
      }),
    };
  } catch (error) {
    console.error("Erreur send-sms:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};