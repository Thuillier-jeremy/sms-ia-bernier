import React, { useState, useEffect } from 'react'
import './ConversationHistory.css'

export default function ConversationHistory() {
  const [conversations, setConversations] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedPhone, setSelectedPhone] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/get-conversations')
      const data = await response.json()

      if (data.success) {
        setConversations(data.conversations || {})
        console.log('✅ Conversations chargées:', data.conversations)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erreur lors du chargement: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="conversation-history"><p>⏳ Chargement des conversations...</p></div>
  }

  if (error) {
    return <div className="conversation-history error"><p>❌ {error}</p></div>
  }

  const phoneNumbers = Object.keys(conversations || {})

  return (
    <div className="conversation-history">
      <h2>📱 Historique des Conversations</h2>
      
      <div className="conversations-container">
        {/* Liste des numéros */}
        <div className="phone-list">
          <h3>Numéros ({phoneNumbers.length})</h3>
          {phoneNumbers.length === 0 ? (
            <p>Aucune conversation</p>
          ) : (
            phoneNumbers.map((phone) => (
              <div
                key={phone}
                className={`phone-item ${selectedPhone === phone ? 'active' : ''}`}
                onClick={() => setSelectedPhone(phone)}
              >
                📞 {phone}
              </div>
            ))
          )}
        </div>

        {/* Messages du numéro sélectionné */}
        <div className="messages-view">
          {selectedPhone ? (
            <>
              <h3>Messages de {selectedPhone}</h3>
              <div className="messages-list">
                {Object.entries(conversations[selectedPhone] || {}).map(([key, conv]) => (
                  <div key={key} className="conversation-block">
                    <div className="conv-header">
                      🕐 {new Date(conv.timestamp).toLocaleString('fr-FR')}
                      <span className="msg-count">({conv.messageCount} messages)</span>
                    </div>
                    <div className="conv-messages">
                      {conv.messages && conv.messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.type}`}>
                          <span className="sender">
                            {msg.type === 'user' ? '👤 Client' : '🤖 Claude'}
                          </span>
                          <span className="text">{msg.text}</span>
                          <span className="time">
                            {new Date(msg.timestamp).toLocaleTimeString('fr-FR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>👈 Sélectionne un numéro pour voir les messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}