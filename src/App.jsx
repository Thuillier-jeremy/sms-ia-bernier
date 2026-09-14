const handleSendMessage = async (userMessage, phoneNumber) => {
  if (!userMessage.trim()) return

  // Ajouter le message utilisateur
  const newMessage = {
    id: Date.now(),
    type: 'user',
    text: userMessage,
    timestamp: new Date().toISOString(),
    phoneNumber
  }

  const updatedMessages = [...messages, newMessage]
  setMessages(updatedMessages)
  setLoading(true)

  try {
    // Appeler la fonction Netlify pour générer une réponse IA
    const response = await fetch('/api/generate-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        phoneNumber,
        conversationHistory: updatedMessages,
        apiKeyAnthropic: config.apiKeyAnthropic
      })
    })

    const data = await response.json()

    if (data.success) {
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: data.response,
        timestamp: new Date().toISOString(),
        phoneNumber
      }

      const messagesWithAI = [...updatedMessages, aiMessage]
      setMessages(messagesWithAI)

      // ✅ SAUVEGARDER DANS SUPABASE
      try {
        await fetch('/api/save-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber,
            messages: messagesWithAI
          })
        })
        console.log('✅ Conversation sauvegardée dans Supabase')
      } catch (error) {
        console.error('❌ Erreur sauvegarde Supabase:', error)
      }

      // Sauvegarder la conversation en localStorage aussi
      let updatedConv = selectedConversation
      if (!updatedConv) {
        updatedConv = {
          id: Date.now(),
          phoneNumber,
          createdAt: new Date().toISOString(),
          messages: messagesWithAI
        }
        const newConversations = [updatedConv, ...conversations]
        setConversations(newConversations)
        setSelectedConversation(updatedConv)
        localStorage.setItem('conversations', JSON.stringify(newConversations))
      } else {
        updatedConv.messages = messagesWithAI
        const updated = conversations.map(c => c.id === updatedConv.id ? updatedConv : c)
        setConversations(updated)
        localStorage.setItem('conversations', JSON.stringify(updated))
      }

      // Envoyer la réponse via SMS (si API M-Target configurée)
      if (config.apiKeyMTarget && config.senderProfile) {
        await sendSMS(phoneNumber, data.response)
      }
    } else {
      setMessages([...updatedMessages, {
        id: Date.now() + 1,
        type: 'error',
        text: 'Erreur: ' + (data.error || 'Impossible de générer une réponse'),
        timestamp: new Date().toISOString()
      }])
    }
  } catch (error) {
    console.error('Erreur:', error)
    setMessages([...updatedMessages, {
      id: Date.now() + 1,
      type: 'error',
      text: 'Erreur réseau: ' + error.message,
      timestamp: new Date().toISOString()
    }])
  } finally {
    setLoading(false)
  }
}