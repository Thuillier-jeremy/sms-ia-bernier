export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { phoneNumber, text } = JSON.parse(event.body);

    // Récupérer les variables d'environnement
    const username = process.env.MTARGET_USERNAME || "aerochatel";
    const password = process.env.MTARGET_PASSWORD;
    const serviceId = process.env.VITE_MTARGET_SERVICE_ID;
    const sender = process.env.VITE_MTARGET_SENDER_PROFILE || "AERO 91";
    const apiUrl = process.env.VITE_MTARGET_API_URL || "https://api-public-2.mtarget.fr/messages";

    if (!phoneNumber || !text || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "phoneNumber, text, et password requis",
        }),
      };
    }

    // Formater le numéro : enlever tous les caractères sauf les chiffres
    let msisdn = phoneNumber.replace(/\D/g, "");
    
    // Si commence par 33 (France +33), garder tel quel
    // Si commence par 0, remplacer par 33
    if (msisdn.startsWith("0")) {
      msisdn = "33" + msisdn.substring(1);
    }

    console.log(`Envoi SMS à ${msisdn} via M-Target`);

    // Construire l'URL avec les paramètres de query
    const url = new URL(apiUrl);
    url.searchParams.append("username", username);
    url.searchParams.append("password", password);
    url.searchParams.append("msisdn", msisdn);
    url.searchParams.append("msg", text);
    url.searchParams.append("serviceid", serviceId);
    url.searchParams.append("sender", sender);

    console.log(`URL (sans password): ${url.toString().replace(password, "***")}`);

    // Faire la requête GET
    const response = await fetch(url.toString());
    const data = await response.json();

    console.log("M-Target response:", data);

    if (response.status !== 200) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          success: false,
          error: `Erreur HTTP ${response.status}`,
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