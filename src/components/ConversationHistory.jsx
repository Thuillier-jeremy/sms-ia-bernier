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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue'
    try {
      let date
      
      // Si c'est un string ISO
      if (typeof timestamp === 'string') {
        date = new Date(timestamp)
      } else {
        // Si c'est un nombre
        date = new Date(parseInt(timestamp))
      }
      
      if (isNaN(date.getTime())) return 'Date invalide'
      return date.toLocaleString('fr-FR')
    } catch (e) {
      return 'Date invalide'
    }
  }

  const getMessagesArray = (messagesData) => {
    if (!messagesData) return []
    if (Array.isArray(messagesData)) return messagesData
    // Si c'est un objet (Firebase convertit les arrays)
    if (typeof messagesData === 'object') {
      return Object.values(messagesData)
    }
    return []
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
      <h2>📋 Historique des Conversations</h2>
      
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
                {Object.entries(conversations[selectedPhone] || {}).map(([key, conv]) => {
                  const messagesArray = getMessagesArray(conv.messages)
                  
                  return (
                    <div key={key} className="conversation-block">
                      <div className="conv-header">
                        🕐 {formatDate(conv.timestamp)}
                        <span className="msg-count">({messagesArray.length} messages)</span>
                      </div>
                      <div className="conv-messages">
                        {messagesArray.length > 0 ? (
                          messagesArray.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.type}`}>
                              <span className="sender">
                                {msg.type === 'user' ? '👤 Client' : '🤖 Claude'}
                              </span>
                              <span className="text">{msg.text}</span>
                              <span className="time">
                                {formatDate(msg.timestamp)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="no-messages">Aucun message</p>
                        )}
                      </div>
                    </div>
                  )
                })}
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