import React, { useState } from 'react'
import './ChatWindow.css'

function ChatWindow({ messages, loading, phoneNumber, onSendMessage, messagesEndRef }) {
  const [inputValue, setInputValue] = useState('')
  const [phoneInput, setPhoneInput] = useState(phoneNumber || '')

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !phoneInput.trim()) return

    onSendMessage(inputValue, phoneInput)
    setInputValue('')
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="messages-empty">
            <p>Aucun message pour le moment</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.type}`}
              >
                <div className="message-content">
                  <p className="message-text">{msg.text}</p>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form className="input-container" onSubmit={handleSend}>
        {!phoneNumber && (
          <input
            type="tel"
            className="phone-input"
            placeholder="Numéro de téléphone"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            required
          />
        )}
        <div className="input-group">
          <input
            type="text"
            className="message-input"
            placeholder="Écrivez votre message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading || !phoneInput.trim()}
            autoFocus
          />
          <button
            type="submit"
            className="send-btn"
            disabled={loading || !inputValue.trim() || !phoneInput.trim()}
          >
            📤 Envoyer
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatWindow
