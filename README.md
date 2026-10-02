# InternshipHub

Discover opportunities. Track applications. Build the skills employers need.

InternshipHub is a modern full-stack web application connecting university students with industry employers through verified skill profiles, transparent completion metrics, and streamlined internship matching.

---

## Current Capabilities

- **Secure Local + Google Authentication**: Cookie-based HTTP-only JWT sessions, Google OAuth 2.0 with collision protection, and immediate onboarding routing.
- **Role-Based Access Control (RBAC)**: Strict separation between `STUDENT`, `COMPANY`, and `ADMIN` workspaces with server-side authorization guards.
- **Student Experience**:
  - Multi-step onboarding with `sessionStorage` draft persistence.
  - Comprehensive, editable student profile (education, career preferences, bio, links).
  - Standardized catalog of 35 curated skills across 9 technical categories with proficiency ratings (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`).
  - Secure Cloudinary profile photo uploads with image magic-byte verification and initial avatar fallback.
- **Company / Employer Experience**:
  - Dedicated multi-step employer onboarding flow.
  - Public-facing and editable company workspace profiles.
  - Secure Cloudinary company logo uploads with initials badge fallback.
- **Transparent Profile Completion**:
  - Deterministic 100-point transparent weighted completion model.
  - Dynamically computed at request time — never stored statically in the database.
  - Clear next-step recommendations and responsive completion widgets for dashboards and profile headers.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, React Router, Lucide Icons, Vanilla CSS Design System
- **Backend**: Node.js, Express, TypeScript, Multer, Zod
- **Database & Storage**: PostgreSQL (Neon Serverless), Prisma ORM, Cloudinary
- **Authentication**: JWT (HTTP-only cookies), Bcrypt, Google Auth Library

---

## Project Structure

```text
internshiphub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI, Student, Company, and Profile components
│   │   ├── pages/          # Auth, Student, Company, and Admin pages
│   │   ├── services/       # Typed API client services
│   │   ├── types/          # Shared frontend data contracts
│   │   └── utils/          # Upload, company, and routing helpers
│   └── public/             # Static assets and illustration imagery
├── server/                 # Express backend
│   ├── prisma/             # Schema definition and idempotent seed script
│   └── src/
│       ├── controllers/    # Auth, Student, and Company controllers
│       ├── middleware/     # Auth, RBAC, and secure upload middlewares
│       ├── routes/         # Express API route modules
│       ├── utils/          # Profile completion engine, token & Cloudinary utils
│       └── validators/     # Zod request validators
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- PostgreSQL database (e.g. Neon)
- Cloudinary account (optional for local image uploads)

### 1. Backend Setup

```bash
cd server
npm install

# Copy example environment file
cp .env.example .env
```

Configure your `server/.env` with placeholders:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:5432/internshiphub?sslmode=require"
JWT_SECRET="your-jwt-secret-key-at-least-32-characters"
JWT_EXPIRES_IN="7d"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"

# Cloudinary (Optional for uploads)
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

Initialize the database and seed the skill catalog:
```bash
# Push Prisma schema to database
npm run prisma:push

# Seed categories and skills (idempotent)
npm run seed

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install

# Copy example environment file
cp .env.example .env
```

Configure `client/.env`:
```env
VITE_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

Start the Vite development server:
```bash
npm run dev
```

The application will be running at `http://localhost:5173`.
