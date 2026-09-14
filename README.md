# SMS Conversationnel IA - Groupe Bernier

Une application web Netlify pour gérer des conversations SMS automatisées avec Claude IA et M-Target.

## Fonctionnalités

✅ **Chat conversationnel en temps réel** - Interface SMS-like avec Claude IA  
✅ **Intégration M-Target** - Envoi/réception de SMS réels  
✅ **Historique persistant** - Sauvegarde locale des conversations  
✅ **Configuration simple** - Pas de backend à configurer  
✅ **Responsive** - Fonctionne sur desktop et mobile  

## Architecture

```
Frontend (React + Vite)
├── Interface de chat SMS
├── Gestion des conversations
└── Configuration des APIs

Netlify Functions (Serverless)
├── generate-response.js   → Claude API
├── send-sms.js          → M-Target API
└── webhook-sms.js       → Réception des SMS entrants
```

## Installation

### 1. Cloner ou créer le projet

```bash
git clone <repo-url>
cd sms-ia-conversationnel
npm install
```

### 2. Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
# Clé API Anthropic (se configure dans l'interface, ou via .env)
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Clés M-Target (se configure dans l'interface, ou via .env)
VITE_MTARGET_API_KEY=votre-clé-mtarget
VITE_MTARGET_SENDER_PROFILE=BERNIER
```

### 3. Développement local

```bash
npm run dev
```

L'app démarre sur `http://localhost:5173`

**Pour tester les fonctions Netlify localement :**

```bash
npm install -g netlify-cli
netlify dev
```

Accès sur `http://localhost:8888`

## Déploiement Netlify

### 1. Pousser le code sur Git

```bash
git add .
git commit -m "Init SMS app"
git push origin main
```

### 2. Connecter Netlify

1. Aller sur [netlify.com](https://netlify.com)
2. Cliquer "Add new site" → "Import an existing project"
3. Sélectionner votre repo GitHub/GitLab
4. Configuration automatique (détecte `netlify.toml`)
5. Déployer

### 3. Configurer les variables d'environnement

Dans les **Netlify settings** → **Build & deploy** → **Environment** :

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_MTARGET_API_KEY=votre-clé
VITE_MTARGET_SENDER_PROFILE=BERNIER
```

## Configuration des APIs

### Claude API (Anthropic)

1. Créer un compte sur [console.anthropic.com](https://console.anthropic.com)
2. Générer une clé API
3. La configurer via le bouton ⚙️ "Configuration" dans l'app

**Modèle utilisé :** `claude-opus-4-1` (adapter si besoin dans `netlify/functions/generate-response.js`)

### M-Target API

1. Accéder à votre dashboard M-Target
2. Générer une clé API avec les droits SMS
3. Vérifier l'URL de l'API (peut varier selon votre plan)
4. Configurer dans l'app

**À adapter dans `netlify/functions/send-sms.js` :**
- URL de l'API : `https://api.m-target.com/v1/sms/send`
- Format de la requête selon votre documentation
- Authentification (Bearer token, headers, etc.)

### Webhook SMS entrant

Pour recevoir les SMS entrants automatiquement :

1. Dans votre dashboard M-Target, configurer le webhook URL :
   ```
   https://votre-domaine.netlify.app/.netlify/functions/webhook-sms
   ```

2. La fonction reçoit le SMS et peut déclencher :
   - Une réponse automatique
   - Une notification en temps réel
   - Une sauvegarde dans une base de données

**Note :** Actuellement, la fonction log simplement le SMS reçu.

## Structure du projet

```
.
├── index.html                       # Point d'entrée HTML
├── vite.config.js                   # Config Vite
├── netlify.toml                     # Config Netlify
├── package.json
├── src/
│   ├── main.jsx                     # Point d'entrée React
│   ├── App.jsx                      # Composant principal
│   ├── App.css
│   └── components/
│       ├── ChatWindow.jsx           # Interface de chat
│       ├── ChatWindow.css
│       ├── ConversationsList.jsx    # Liste des conversations
│       ├── ConversationsList.css
│       ├── ConfigPanel.jsx          # Panneau de configuration
│       └── ConfigPanel.css
└── netlify/functions/
    ├── generate-response.js         # ← Claude API
    ├── send-sms.js                  # ← M-Target envoi
    └── webhook-sms.js               # ← M-Target réception
```

## Utilisation

### 1. Configurer les APIs

- Cliquer sur ⚙️ en haut à droite
- Entrer votre clé Anthropic
- Entrer votre clé M-Target et profil d'expéditeur
- Sauvegarder (stocké localement)

### 2. Démarrer une conversation

- Cliquer "+ Nouvelle conversation"
- Entrer un numéro de téléphone
- Taper un message
- Cliquer "Envoyer"

### 3. La réponse IA

Claude répond automatiquement en tenant compte du contexte de la conversation.

Si M-Target est configuré, la réponse est aussi envoyée par SMS au numéro.

## Personnalisation

### Changer le comportement de Claude

Éditer `netlify/functions/generate-response.js`, ligne du `system` prompt :

```javascript
system: `Tu es un agent de service client pour Groupe Bernier.
Tu aides avec les réservations, réclamations, et questions sur les véhicules.
Réponds en moins de 160 caractères.`
```

### Adapter l'intégration M-Target

M-Target peut avoir une API différente selon le prestataire/plan.

Vérifier votre documentation M-Target et adapter :
- L'URL API
- La structure de la requête
- Les headers d'authentification
- Le format de la réponse

Exemple de variation possible :

```javascript
// Au lieu de :
const response = await axios.post("https://api.m-target.com/v1/sms/send", {...})

// Possible :
const response = await axios.post("https://platform.m-target.com/send", {...})
```

### Sauvegarder en base de données

Pour persister les conversations au-delà du localStorage :

1. Ajouter une nouvelle fonction Netlify (`save-conversation.js`)
2. Utiliser une base de données (Supabase, Firebase, MongoDB, etc.)
3. Appeler la fonction après chaque message

Exemple avec Supabase :

```javascript
// Dans App.jsx
const saveConversation = async (conv) => {
  await fetch('/api/save-conversation', {
    method: 'POST',
    body: JSON.stringify({
      id: conv.id,
      phoneNumber: conv.phoneNumber,
      messages: conv.messages
    })
  })
}
```

## Limitations et notes

- **Stockage** : Les conversations sont sauvegardées en localStorage (5-10 MB max selon le navigateur)
- **Temps de réponse** : L'IA peut prendre 1-3s selon la charge Anthropic
- **SMS** : M-Target est limité aux SMS standard (160 caractères)
- **Concurrent** : Testé pour quelques conversations en parallèle

## Troubleshooting

### Erreur "API key not found"
- Vérifier la clé dans le panneau de configuration
- Vérifier les variables d'environnement Netlify
- Vérifier qu'elle commence par `sk-ant-`

### SMS non envoyés
- Vérifier la clé M-Target
- Vérifier le format du numéro (+33... ou 0...)
- Vérifier l'URL de l'API M-Target
- Consulter les logs Netlify

### Temps de réponse lent
- Vérifier la limite d'utilisation Claude
- Réduire `max_tokens` dans `generate-response.js`
- Utiliser un modèle plus léger (`claude-opus-4` au lieu de `claude-opus-4-1`)

## Support

Pour les questions :
- **Claude API** → https://docs.anthropic.com
- **Netlify** → https://docs.netlify.com
- **M-Target** → Votre documentation M-Target

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024  
**Auteur** : Groupe Bernier
