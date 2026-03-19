# 🚗 BF Auto Market — Agent IA V7

Agent IA de sourcing automobile Europe/Japon/USA → Burkina Faso.
Scanne automatiquement Mobile.de, AutoScout24, BE FORWARD, SBT Japan et calcule la marge rendu Ouagadougou.

---

## 🚀 Déploiement en 7 étapes

### Pré-requis
- Un compte **GitHub** (tu l'as ✅)
- Un compte **Vercel** (tu l'as ✅)
- **Node.js** installé sur ton PC (à faire ⬇️)

---

### ÉTAPE 1 — Installer Node.js sur ton PC

1. Va sur **https://nodejs.org/fr**
2. Télécharge la version **LTS** (bouton vert)
3. Installe-le (suivant, suivant, terminer)
4. Ouvre un terminal (PowerShell sur Windows, Terminal sur Mac) et vérifie :

```bash
node --version
# Doit afficher v20.x.x ou plus
npm --version
# Doit afficher 10.x.x ou plus
```

---

### ÉTAPE 2 — Créer le projet Supabase (base de données gratuite)

1. Va sur **https://supabase.com** → Sign Up (utilise ton GitHub)
2. Clique **New Project**
   - Nom : `bfautomarket`
   - Mot de passe : choisis-en un (note-le)
   - Région : **West EU (Ireland)** (plus proche du BF)
3. Attends 2 minutes que le projet se crée
4. Va dans **Settings → API** et note :
   - `Project URL` → c'est ton `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → c'est ton `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → c'est ton `SUPABASE_SERVICE_KEY`
5. Va dans **SQL Editor** → colle le contenu du fichier `supabase-schema.sql` → clique **Run**

---

### ÉTAPE 3 — Obtenir ta clé API Anthropic

1. Va sur **https://console.anthropic.com**
2. Crée un compte ou connecte-toi
3. Va dans **Settings → API Keys**
4. Clique **Create Key** → nomme-la `bfautomarket`
5. **Copie la clé** (commence par `sk-ant-...`) → note-la, elle ne sera plus visible
6. Va dans **Plans & Billing** → ajoute un moyen de paiement
   - Le coût estimé est ~30€/mois pour ~30 scans/jour

---

### ÉTAPE 4 — Mettre le code sur GitHub

1. Sur ton PC, ouvre un terminal et va où tu veux stocker le projet :

```bash
cd ~/Desktop
```

2. Dézippe le fichier `bfautomarket.zip` que tu as téléchargé depuis Claude

3. Entre dans le dossier :

```bash
cd bfautomarket
```

4. Crée le repo GitHub et pousse le code :

```bash
git init
git add .
git commit -m "BF Auto Market V7 - Agent IA sourcing"
git branch -M main
git remote add origin https://github.com/TON-USERNAME/bfautomarket.git
git push -u origin main
```

> ⚠️ Remplace `TON-USERNAME` par ton nom d'utilisateur GitHub.
> Si le repo n'existe pas encore, crée-le d'abord sur github.com → New Repository → nom: `bfautomarket` → Public ou Private → Create

---

### ÉTAPE 5 — Déployer sur Vercel

1. Va sur **https://vercel.com/dashboard**
2. Clique **Add New → Project**
3. Sélectionne ton repo GitHub `bfautomarket`
4. **Framework Preset** : Next.js (détecté automatiquement)
5. Clique **Environment Variables** et ajoute :

| Variable | Valeur |
|----------|--------|
| `ANTHROPIC_API_KEY` | `sk-ant-xxxx...` (ta clé Anthropic) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJxxxx...` |
| `SUPABASE_SERVICE_KEY` | `eyJxxxx...` |
| `CRON_SECRET` | Un mot de passe que tu inventes |

6. Clique **Deploy** → attends 2 minutes
7. Ton site est en ligne ! 🎉 URL : `https://bfautomarket.vercel.app`

---

### ÉTAPE 6 — Ajouter ton domaine bfautomarket.com

1. Achète le domaine sur **https://namecheap.com** ou **https://ovh.com** (~10€/an)
   - Cherche `bfautomarket.com` (ou `.fr`, `.africa`)
2. Sur Vercel → ton projet → **Settings → Domains**
3. Tape `bfautomarket.com` → **Add**
4. Vercel te donne des **DNS records** à configurer :
   - Type `A` → `76.76.21.21`
   - Type `CNAME` → `cname.vercel-dns.com`
5. Va sur ton registrar (Namecheap/OVH) → DNS → ajoute ces records
6. Attends 5-30 minutes → ton site est sur **bfautomarket.com** !

---

### ÉTAPE 7 — Activer le scan automatique (cron)

Le fichier `vercel.json` configure déjà un cron à 7h chaque matin.
Sur **Vercel Pro** (20€/mois), les crons sont inclus.
Sur **Vercel Hobby** (gratuit), les crons ne fonctionnent pas — alternative :

**Alternative gratuite avec cron-job.org :**
1. Va sur **https://cron-job.org** → crée un compte gratuit
2. Crée un nouveau cron job :
   - URL : `https://bfautomarket.com/api/cron`
   - Schedule : `0 7 * * *` (chaque jour à 7h)
   - Headers : `Authorization: Bearer TON-CRON-SECRET`
3. Active-le → chaque matin à 7h, l'agent scanne automatiquement

---

## 📁 Structure du projet

```
bfautomarket/
├── app/
│   ├── api/
│   │   ├── agent/route.js    ← API proxy sécurisé (clé cachée)
│   │   └── cron/route.js     ← Scan automatique quotidien
│   ├── globals.css            ← Styles dark theme
│   ├── layout.js              ← Layout + fonts
│   └── page.js                ← Page principale
├── components/
│   └── Agent.jsx              ← L'agent V7 complet (dark gold)
├── lib/
│   ├── db.js                  ← Couche base de données
│   └── supabase.js            ← Client Supabase
├── .env.example               ← Template des variables
├── .gitignore
├── next.config.js
├── package.json
├── supabase-schema.sql        ← Schema à copier dans Supabase
├── vercel.json                ← Config cron jobs
└── README.md                  ← Ce fichier
```

---

## 💰 Coûts mensuels estimés

| Service | Coût |
|---------|------|
| Vercel Hobby | Gratuit |
| Supabase Free | Gratuit |
| Domaine .com | ~1€/mois |
| API Anthropic (~30 scans/jour) | ~25-35€/mois |
| **TOTAL** | **~30-40€/mois** |

> Avec 1 seul véhicule vendu avec +3 000€ de marge, tu rentabilises 6 mois d'hébergement.

---

## 🔒 Sécurité

- ✅ Clé API Anthropic côté serveur uniquement (`/api/agent`)
- ✅ Rate limiting (30 requêtes/heure par IP)
- ✅ Cron protégé par clé secrète
- ✅ Variables d'environnement sur Vercel (jamais dans le code)
- ✅ Row Level Security activé sur Supabase

---

## 🛠️ Développement local

```bash
npm install
cp .env.example .env.local
# Remplis .env.local avec tes vraies clés
npm run dev
# Ouvre http://localhost:3000
```
