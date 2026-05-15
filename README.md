# Alexander AI Solutions — Remote Services

> AI-powered remote repair platform for desktop and laptop computers.

Instantly diagnose computer issues using AI vision, get step-by-step repair guides, and connect with a remote technician — all from your phone.

---

## 📱 Features

- **AI Diagnostics** — Upload a photo or describe your issue; AI identifies the top 3 likely causes with confidence scores
- **Guided Repair** — Step-by-step fix instructions with parts list and cost estimates
- **Remote Tech Sessions** — Book a live video session with a certified technician
- **Job History** — All your past diagnoses and repairs in one place

---

## 🗂 Project Structure

```
alexander-ai/
├── backend/          # Node.js + Express REST API
│   ├── src/
│   │   ├── routes/   # auth, diagnose, jobs, technicians
│   │   ├── services/ # OpenAI Vision integration
│   │   ├── middleware/
│   │   └── db/       # PostgreSQL schema
│   └── .env.example
└── mobile/           # React Native + Expo app
    ├── App.js
    └── src/
        ├── screens/  # All app screens
        ├── components/
        ├── context/
        ├── services/ # API client
        └── theme/    # Colors, typography
```

---

## 🚀 Quick Start

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your API keys in .env
npm install
npm run dev
```

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `i` for iOS simulator / `a` for Android emulator.

---

## ⚙️ Environment Variables

See `backend/.env.example` for all required variables:

| Variable | Description |
|---|---|
| `PORT` | API server port (default 3000) |
| `JWT_SECRET` | Secret for signing auth tokens |
| `OPENAI_API_KEY` | OpenAI API key (GPT-4 Vision) |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments |
| `DATABASE_URL` | PostgreSQL connection string |

---

## 🗄 Database Setup

```bash
# Create database
createdb alexander_ai

# Run schema
psql alexander_ai < backend/src/db/schema.sql
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo |
| Backend | Node.js + Express |
| AI | OpenAI GPT-4 Vision |
| Database | PostgreSQL |
| Payments | Stripe + Stripe Connect |
| Auth | JWT |

---

## 📦 Deployment

### Backend (Railway / Render / Fly.io)
1. Set all environment variables from `.env.example`
2. Set `NODE_ENV=production`
3. Deploy — the server starts with `npm start`

### Mobile (Expo EAS)
```bash
npm install -g eas-cli
eas build --platform all
eas submit
```

---

## 🏢 Brand

**Alexander AI Solutions** — Trustworthy, technical, modern.
- Primary: Deep Navy `#0A1628`
- Accent: Electric Blue `#007AFF`

---

*Built with ❤️ by Alexander AI Solutions*
