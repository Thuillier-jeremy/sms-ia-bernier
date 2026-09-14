# Guide Rapide - Déploiement Netlify

## 🚀 Déployer en 5 minutes

### Option 1 : GitHub + Netlify (Recommandé)

1. **Pousser sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VOTRE-USERNAME/sms-ia.git
   git push -u origin main
   ```

2. **Connecter Netlify**
   - Aller sur https://netlify.com
   - Cliquer "Add new site" → "Import an existing project"
   - Connecter GitHub, sélectionner le repo
   - Netlify détecte automatiquement `netlify.toml`
   - Cliquer "Deploy"

3. **Ajouter les variables d'environnement**
   - Dans Netlify Dashboard : **Site settings** → **Build & deploy** → **Environment**
   - Ajouter :
     ```
     VITE_ANTHROPIC_API_KEY=sk-ant-...
     ```
   - **Redéployer** (Netlify le fait automatiquement)

---

### Option 2 : Drag & Drop (Plus lent, pas d'auto-updates)

1. **Créer le bundle**
   ```bash
   npm install
   npm run build
   ```

2. **Sur Netlify**
   - Aller à https://app.netlify.com/drop
   - Glisser-déposer le dossier `dist/`
   - Netlify génère une URL aléatoire
   - ⚠️ Pas d'auto-updates ni de CI/CD

---

## 🔧 Configuration des Clés API

### Clé Anthropic

1. Aller sur https://console.anthropic.com/keys
2. Créer une nouvelle clé
3. Copier (format : `sk-ant-v...`)
4. Ajouter dans Netlify environment variables

### Clé M-Target

1. Aller à votre dashboard M-Target
2. Générer une clé API SMS
3. Noter aussi :
   - **Profil d'expéditeur** (ex: "BERNIER" ou un numéro court)
   - **URL de l'API** (à adapter dans `netlify/functions/send-sms.js`)
4. Ajouter dans les variables Netlify ou configurer dans l'interface web

---

## 🧪 Tester localement

Avant de déployer :

```bash
npm install
npm run dev
```

Puis tester sur `http://localhost:5173`

Avec les functions Netlify :
```bash
netlify dev
```

Sur `http://localhost:8888`

---

## 📊 Domaine personnalisé

1. Dans Netlify Dashboard → **Site settings** → **Build & deploy** → **Custom domain**
2. Ajouter votre domaine (ex: `sms.bernier.fr`)
3. Configurer les DNS chez votre registraire
4. SSL automatique (Netlify)

---

## 🔗 Webhook M-Target (SMS entrants)

Pour recevoir automatiquement les SMS entrants :

1. Dashboard M-Target → **Webhooks** ou **Configuration**
2. Ajouter l'URL :
   ```
   https://votre-site.netlify.app/.netlify/functions/webhook-sms
   ```
3. Configurer le type : **SMS entrant**
4. Tester l'envoi de test SMS

La fonction reçoit le SMS automatiquement.

---

## 📝 Logs et Debug

**Netlify Dashboard** → **Functions** → Sélectionner la fonction → **Logs**

Voir en temps réel les erreurs et les logs console.

---

## 🎯 Prochaines étapes

- [ ] Configurer la base de données (optionnel)
- [ ] Connecter les SMS entrants à la liste des conversations
- [ ] Ajouter une intégration CRM (Salesforce, etc.)
- [ ] Configurer les alertes Slack/Email en cas d'erreur

---

**Besoin d'aide ?**
- Docs Netlify : https://docs.netlify.com
- Docs Claude : https://docs.anthropic.com
