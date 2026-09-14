# Intégration Base de Données (Optionnel)

Par défaut, l'app sauvegarde les conversations en **localStorage** (navigateur uniquement).

Pour une solution **persistante** (multi-utilisateurs, backups, analytics) :

## 1. Supabase (PostgreSQL - Recommandé)

### Installation

```bash
npm install @supabase/supabase-js
```

### Configuration Netlify

Dans les variables d'environnement :
```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Fonction Netlify pour sauvegarder

`netlify/functions/save-conversation.js` :

```javascript
import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  const { conversationId, phoneNumber, messages } = JSON.parse(event.body);

  const { data, error } = await supabase
    .from("conversations")
    .upsert({
      id: conversationId,
      phone_number: phoneNumber,
      messages: messages,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
```

### Schéma PostgreSQL

```sql
CREATE TABLE conversations (
  id BIGINT PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  messages JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE sms_logs (
  id SERIAL PRIMARY KEY,
  conversation_id BIGINT REFERENCES conversations(id),
  direction VARCHAR(10),  -- 'inbound' ou 'outbound'
  phone_number VARCHAR(20),
  message TEXT,
  status VARCHAR(50),  -- 'sent', 'delivered', 'failed'
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_conversations_phone ON conversations(phone_number);
CREATE INDEX idx_sms_logs_conv ON sms_logs(conversation_id);
```

---

## 2. Firebase (NoSQL)

### Installation

```bash
npm install firebase
```

### Configuration

`src/firebase.js` :

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### Utilisation dans App.jsx

```javascript
import { db } from "./firebase";
import {
  collection,
  setDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const saveConversation = async (conversation) => {
  await setDoc(
    doc(db, "conversations", conversation.id.toString()),
    {
      phoneNumber: conversation.phoneNumber,
      messages: conversation.messages,
      updatedAt: new Date(),
    }
  );
};
```

---

## 3. MongoDB + Netlify Functions

### Installation

```bash
npm install mongodb
```

### Fonction Netlify

`netlify/functions/save-conversation-mongodb.js` :

```javascript
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export const handler = async (event) => {
  try {
    await client.connect();
    const db = client.db("sms_app");
    const conversations = db.collection("conversations");

    const { conversationId, phoneNumber, messages } = JSON.parse(event.body);

    await conversations.updateOne(
      { _id: conversationId },
      {
        $set: {
          phoneNumber,
          messages,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await client.close();
  }
};
```

---

## Comparaison

| Solution | Type | Coût | Facilité | Scaling |
|----------|------|------|----------|---------|
| **localStorage** | Navigateur | Gratuit | ⭐⭐⭐⭐⭐ | ⚠️ Local uniquement |
| **Supabase** | PostgreSQL | Gratuit (5GB) | ⭐⭐⭐⭐ | ✅ Excellent |
| **Firebase** | NoSQL | Gratuit (1GB) | ⭐⭐⭐ | ✅ Très bon |
| **MongoDB** | NoSQL | Gratuit (512MB) | ⭐⭐⭐ | ✅ Excellent |

---

## Recommandation pour Groupe Bernier

**Supabase** :
- ✅ PostgreSQL = données structurées (bonne pour les rapports)
- ✅ Free tier généreux
- ✅ SQL facile pour les analyses
- ✅ REST API intégrée
- ✅ Real-time subscriptions (pour les SMS entrants)

**Pas nécessaire dans une première version**, mais utile si vous voulez :
- Multi-utilisateurs / multi-sites
- Historique persistent
- Analytics et reporting
- Sync avec d'autres systèmes

---

**Note** : Les conversations sauvegardées en localStorage restent disponibles même sans BDD.
Vous pouvez commencer sans, et ajouter une BDD plus tard.
