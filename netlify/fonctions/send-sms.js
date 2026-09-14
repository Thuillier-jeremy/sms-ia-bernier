import axios from "axios";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { phoneNumber, text, apiKeyMTarget, senderProfile, serviceId, apiUrl } = JSON.parse(
      event.body
    );

    if (!phoneNumber || !text || !apiKeyMTarget || !senderProfile) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Numéro de téléphone, texte, clé API M-Target et profil requis",
        }),
      };
    }

    // Format du numéro (ajouter +33 si France)
    let formattedPhone = phoneNumber.replace(/\s+/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "33" + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    // apiKeyMTarget contient déjà le base64 (username:password encodé)
    const response = await axios.post(
      apiUrl || "https://api-public-2.mtarget.fr/messages",
      {
        messages: [
          {
            to: formattedPhone,
            text: text,
            sender: senderProfile,
            serviceId: serviceId,
          },
        ],
      },
      {
        headers: {
          Authorization: `Basic ${apiKeyMTarget}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("M-Target response:", response.data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: response.data.id || response.data.message_id || "sent",
      }),
    };
  } catch (error) {
    console.error("Erreur M-Target:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: "Erreur d'authentification M-Target. Vérifiez vos identifiants.",
        }),
      };
    }

    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de l'envoi du SMS",
      }),
    };
  }
};