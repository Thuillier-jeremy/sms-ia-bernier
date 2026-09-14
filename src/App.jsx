import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import ConversationsList from './components/ConversationsList'
import ChatWindow from './components/ChatWindow'
import ConfigPanel from './components/ConfigPanel'

function App() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    apiKeyAnthropic: localStorage.getItem('apiKeyAnthropic') || '',
    apiKeyMTarget: localStorage.getItem('apiKeyMTarget') || '',
    senderProfile: localStorage.getItem('senderProfile') || '',
  })
  const [showConfig, setShowConfig] = useState(!config.apiKeyAnthropic)
  const messagesEndRef = useRef(null)

  // Charger les conversations sauvegardées
  useEffect(() => {
    const saved = localStorage.getItem('conversations')
    if (saved) {
      const parsed = JSON.parse(saved)
      setConversations(parsed)
      if (parsed.length > 0 && !selectedConversation) {
        selectConversation(parsed[0])
      }
    }
  }, [])

  // Scroller vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectConversation = (conv) => {
    setSelectedConversation(conv)
    setMessages(conv.messages || [])
  }

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig)
    localStorage.setItem('apiKeyAnthropic', newConfig.apiKeyAnthropic)
    localStorage.setItem('apiKeyMTarget', newConfig.apiKeyMTarget)
    localStorage.setItem('senderProfile', newConfig.senderProfile)
    setShowConfig(false)
  }

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

  const sendSMS = async (phoneNumber, text) => {
    try {
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          text,
          apiKeyMTarget: config.apiKeyMTarget,
          senderProfile: config.senderProfile
        })
      })
    } catch (error) {
      console.error('Erreur SMS:', error)
    }
  }

const handleNewConversation = () => {
  const newConv = {
    id: Date.now(),
    phoneNumber: '',
    createdAt: new Date().toISOString(),
    messages: []
  }
  setSelectedConversation(newConv)
  setMessages([])
}
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>SMS Conversationnel IA</h1>
          <button 
            className="config-btn"
            onClick={() => setShowConfig(!showConfig)}
          >
            ⚙️ Configuration
          </button>
        </div>
      </header>

      {showConfig && (
        <ConfigPanel
          config={config}
          onSave={handleSaveConfig}
          onClose={() => setShowConfig(false)}
        />
      )}

      <div className="app-container">
        <aside className="sidebar">
          <button 
            className="new-conversation-btn"
            onClick={handleNewConversation}
          >
            + Nouvelle conversation
          </button>
          <ConversationsList
            conversations={conversations}
            selectedId={selectedConversation?.id}
            onSelect={selectConversation}
          />
        </aside>

        <main className="chat-area">
          {selectedConversation || messages.length > 0 ? (
            <ChatWindow
              messages={messages}
              loading={loading}
              phoneNumber={selectedConversation?.phoneNumber}
              onSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-state-content">
                <h2>Bienvenue</h2>
                <p>Démarrez une nouvelle conversation ou sélectionnez-en une existante.</p>
                <button 
                  className="primary-btn"
                  onClick={handleNewConversation}
                >
                  Commencer une conversation
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App