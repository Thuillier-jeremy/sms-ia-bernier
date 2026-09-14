import React, { useState } from 'react'
import './ConfigPanel.css'

function ConfigPanel({ config, onSave, onClose }) {
  const [formData, setFormData] = useState(config)
  const [showPasswords, setShowPasswords] = useState({
    apiKeyAnthropic: false,
    apiKeyMTarget: false
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="config-panel-overlay">
      <div className="config-panel">
        <div className="config-header">
          <h2>Configuration</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="config-form">
          <div className="form-section">
            <h3>API Anthropic (Claude)</h3>
            <p className="section-help">
              Obtenez votre clé API sur <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer">console.anthropic.com</a>
            </p>
            <div className="form-group">
              <label>Clé API Claude</label>
              <div className="password-input-group">
                <input
                  type={showPasswords.apiKeyAnthropic ? 'text' : 'password'}
                  name="apiKeyAnthropic"
                  value={formData.apiKeyAnthropic}
                  onChange={handleChange}
                  placeholder="sk-ant-..."
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility('apiKeyAnthropic')}
                >
                  {showPasswords.apiKeyAnthropic ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>M-Target (SMS)</h3>
            <p className="section-help">
              Configurez vos identifiants M-Target pour envoyer des SMS
            </p>
            <div className="form-group">
              <label>Clé API M-Target</label>
              <div className="password-input-group">
                <input
                  type={showPasswords.apiKeyMTarget ? 'text' : 'password'}
                  name="apiKeyMTarget"
                  value={formData.apiKeyMTarget}
                  onChange={handleChange}
                  placeholder="Votre clé API M-Target"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility('apiKeyMTarget')}
                >
                  {showPasswords.apiKeyMTarget ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Profil d'expéditeur</label>
              <input
                type="text"
                name="senderProfile"
                value={formData.senderProfile}
                onChange={handleChange}
                placeholder="Ex: BERNIER ou votre numéro court"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">Sauvegarder</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConfigPanel
