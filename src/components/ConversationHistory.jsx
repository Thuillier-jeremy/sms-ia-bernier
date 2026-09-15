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

      console.log('📥 Raw API response:', data)

      if (data.success) {
        setConversations(data.conversations || {})
        console.log('✅ Conversations set:', data.conversations)
        console.log('📊 Phone numbers:', Object.keys(data.conversations || {}))
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erreur lors du chargement: ' + err.message)
      console.error('❌ Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    console.log('🕐 Formatting timestamp:', timestamp, 'type:', typeof timestamp)
    if (!timestamp) return 'Date inconnue'
    try {
      let date
      
      if (typeof timestamp === 'string') {
        date = new Date(timestamp)
      } else {
        date = new Date(parseInt(timestamp))
      }
      
      if (isNaN(date.getTime())) return 'Date invalide'
      return date.toLocaleString('fr-FR')
    } catch (e) {
      console.error('❌ Date format error:', e)
      return 'Date invalide'
    }
  }

  const getMessagesArray = (messagesData) => {
    console.log('📝 Processing messages:', messagesData)
    if (!messagesData) return []
    if (Array.isArray(messagesData)) return messagesData
    if (typeof messagesData === 'object') {
      const arr = Object.values(messagesData)
      console.log('✅ Converted to array:', arr)
      return arr
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
  console.log('📱 Phone numbers for display:', phoneNumbers)

  return (
    <div className="conversation-history">
      <h2>📋 Historique des Conversations</h2>
      
      <div className="conversations-container">
        <div className="phone-list">
          <h3>Numéros ({phoneNumbers.length})</h3>
          {phoneNumbers.length === 0 ? (
            <p>Aucune conversation</p>
          ) : (
            phoneNumbers.map((phone) => (
              <div
                key={phone}
                className={`phone-item ${selectedPhone === phone ? 'active' : ''}`}
                onClick={() => {
                  console.log('📱 Selected phone:', phone)
                  setSelectedPhone(phone)
                }}
              >
                📞 {phone}
              </div>
            ))
          )}
        </div>

        <div className="messages-view">
          {selectedPhone ? (
            <>
              <h3>Messages de {selectedPhone}</h3>
              <div className="messages-list">
                {(() => {
                  console.log('🔍 Current conversations data:', conversations)
                  console.log('🔍 Data for selected phone:', conversations[selectedPhone])
                  const entries = Object.entries(conversations[selectedPhone] || {})
                  console.log('🔍 Entries:', entries)
                  
                  return entries.map(([key, conv]) => {
                    console.log('📌 Processing conversation:', key, conv)
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
                  })
                })()}
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