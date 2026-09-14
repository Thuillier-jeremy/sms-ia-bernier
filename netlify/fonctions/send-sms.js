import axios from "axios";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { phoneNumber, text, apiKeyMTarget, senderProfile } = JSON.parse(
      event.body
    );

    if (!phoneNumber || !text || !apiKeyMTarget || !senderProfile) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            "Numéro de téléphone, texte, clé API M-Target et profil d'expéditeur requis",
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

    // Appel API M-Target pour envoyer un SMS
    // Adaptez les paramètres selon votre configuration M-Target
    const response = await axios.post(
      "https://api.m-target.com/v1/sms/send", // URL à adapter selon votre documentation M-Target
      {
        phone: formattedPhone,
        message: text,
        from: senderProfile,
        type: "sms",
      },
      {
        headers: {
          Authorization: `Bearer ${apiKeyMTarget}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: response.data.id || response.data.message_id,
      }),
    };
  } catch (error) {
    console.error("Erreur M-Target:", error.response?.data || error.message);

    // Si c'est une erreur de configuration, retourner un message utile
    if (error.response?.status === 401) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error:
            "Erreur d'authentification M-Target. Vérifiez votre clé API.",
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
