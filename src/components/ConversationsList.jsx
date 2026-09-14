import React from 'react'
import './ConversationsList.css'

function ConversationsList({ conversations, selectedId, onSelect }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier'
    } else {
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    }
  }

  const getPreview = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'Aucun message'
    }
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    return lastMessage.text.substring(0, 40) + (lastMessage.text.length > 40 ? '...' : '')
  }

  return (
    <div className="conversations-list">
      {conversations.length === 0 ? (
        <div className="empty-conversations">
          <p>Pas de conversations</p>
        </div>
      ) : (
        <ul>
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className={`conversation-item ${selectedId === conv.id ? 'active' : ''}`}
              onClick={() => onSelect(conv)}
            >
              <div className="conversation-header">
                <span className="phone-number">📱 {conv.phoneNumber}</span>
                <span className="timestamp">{formatDate(conv.createdAt)}</span>
              </div>
              <div className="conversation-preview">{getPreview(conv)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ConversationsList
