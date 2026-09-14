# ✅ Checklist de Déploiement

## Avant le déploiement

- [ ] **Cloner/télécharger le code**
  ```bash
  git clone <repo> && cd sms-ia-conversationnel
  ```

- [ ] **Installer les dépendances**
  ```bash
  npm install
  ```

- [ ] **Tester localement**
  ```bash
  npm run dev
  # Vérifier http://localhost:5173
  ```

- [ ] **Build test**
  ```bash
  npm run build
  # Vérifier qu'il n'y a pas d'erreurs
  ```

## Préparation des clés API

- [ ] **Clé Anthropic**
  - [ ] Aller sur https://console.anthropic.com/keys
  - [ ] Créer une nouvelle clé (ou récupérer existante)
  - [ ] Copier le format exact : `sk-ant-v0...`
  - [ ] ⚠️ Ne pas commit cette clé sur GitHub

- [ ] **Clé M-Target**
  - [ ] Accès au dashboard M-Target
  - [ ] Générer une clé API SMS
  - [ ] Noter le **profil d'expéditeur** (ex: BERNIER ou numéro court)
  - [ ] Vérifier l'URL API correcte (important!)
  - [ ] Copier et sécuriser la clé

## Configuration GitHub (si CI/CD)

- [ ] **Créer repo GitHub**
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/VOTRE-USERNAME/sms-ia-bernier.git
  git push -u origin main
  ```

- [ ] **⚠️ Ne jamais pousher les clés API directes** (utiliser `.env.local`)

## Configuration Netlify

- [ ] **Connecter Netlify à GitHub**
  - [ ] Aller sur https://netlify.com
  - [ ] Cliquer "Add new site" → "Import an existing project"
  - [ ] Authentifier GitHub
  - [ ] Sélectionner le repo

- [ ] **Configuration auto-détectée**
  - [ ] Netlify lit `netlify.toml`
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`
  - [ ] ✅ Cliquer "Deploy"

- [ ] **Ajouter les variables d'environnement**
  - [ ] Dans Netlify Dashboard → **Site settings**
  - [ ] → **Build & deploy** → **Environment**
  - [ ] Ajouter chaque variable :
    ```
    VITE_ANTHROPIC_API_KEY = sk-ant-...
    VITE_MTARGET_API_KEY = (votre-clé)
    VITE_MTARGET_SENDER_PROFILE = BERNIER
    ```
  - [ ] **Sauvegarder**

- [ ] **Redéployer après configuration**
  - [ ] Netlify Dashboard → **Deploys**
  - [ ] Cliquer "Trigger deploy" ou pusher un commit

## Test de l'application

- [ ] **Accès au site**
  - [ ] Copier l'URL Netlify (ex: https://competent-lalande-a1b2c3.netlify.app)
  - [ ] Ouvrir dans le navigateur

- [ ] **Configuration in-app**
  - [ ] Cliquer ⚙️ en haut à droite
  - [ ] Entrer clé Anthropic
  - [ ] Entrer clé M-Target + profil
  - [ ] Tester "Sauvegarder"

- [ ] **Test d'une conversation**
  - [ ] "+ Nouvelle conversation"
  - [ ] Entrer un numéro de test
  - [ ] Envoyer un message
  - [ ] ✅ Vérifier que Claude répond
  - [ ] ✅ Vérifier que SMS est envoyé (check M-Target dashboard)

## Configuration des webhooks M-Target (optionnel mais recommandé)

- [ ] **Configurer réception SMS entrants**
  - [ ] Dashboard M-Target → Webhooks
  - [ ] Ajouter nouveau webhook
  - [ ] URL: `https://votre-site.netlify.app/.netlify/functions/webhook-sms`
  - [ ] Type: SMS entrant
  - [ ] Événement: SMS reçu
  - [ ] Tester avec SMS de test

- [ ] **Vérifier logs Netlify**
  - [ ] Dashboard → Functions → webhook-sms
  - [ ] Consulter les logs en temps réel
  - [ ] ✅ Vérifier que SMS entrant est reçu

## Domaine personnalisé (optionnel)

- [ ] **Si vous avez un domaine Bernier**
  - [ ] Netlify Dashboard → **Site settings** → **Build & deploy**
  - [ ] → **Custom domain**
  - [ ] Entrer domaine (ex: sms.bernier.fr)
  - [ ] Configurer DNS chez votre registraire
  - [ ] ✅ SSL automatique

## Configuration avancée (optionnel)

- [ ] **Base de données** (si multi-utilisateurs)
  - [ ] Consulter `DATABASE.md`
  - [ ] Choisir Supabase/Firebase/MongoDB
  - [ ] Configurer schema
  - [ ] Adapter les fonctions Netlify

- [ ] **Alertes/Monitoring**
  - [ ] Netlify → Site settings → Monitoring
  - [ ] Configurer notifications Slack/Email en cas d'erreur

- [ ] **Custom prompt Claude**
  - [ ] Éditer `netlify/functions/generate-response.js`
  - [ ] Adapter le `system` prompt à votre besoin
  - [ ] Pusher sur GitHub (redéploiement auto)

## Maintenance

- [ ] **Vérifier quotidiennement**
  - [ ] Netlify Dashboard → Functions → Logs
  - [ ] M-Target Dashboard → Statistiques SMS
  - [ ] Anthropic Console → Usage

- [ ] **Mise à jour des clés**
  - [ ] Si clé compromise: rotationner immédiatement
  - [ ] Mettre à jour dans Netlify Environment

- [ ] **Backup conversations**
  - [ ] Exporter localStorage régulièrement (console navigateur)
  - [ ] Ou configurer une base de données

## Troubleshooting rapide

| Problème | Solution |
|----------|----------|
| "API key not found" | Vérifier les variables d'env Netlify |
| SMS non envoyés | Vérifier clé M-Target + URL API |
| Claude ne répond pas | Vérifier logs Netlify → generate-response |
| Slow response | Réduire max_tokens ou utiliser modèle plus léger |
| Domaine ne fonctionne pas | Vérifier DNS + SSL dans Netlify |

---

## Support & Documentation

- **Docs Netlify** : https://docs.netlify.com
- **Docs Claude API** : https://docs.anthropic.com
- **M-Target** : Consulter votre documentation

---

**Date déploiement** : ___ / ___ / ______  
**Personne responsable** : ________________  
**Domaine** : ________________  
**Status** : ☐ En développement | ☐ En production | ☐ Archived
