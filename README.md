# InternshipHub

InternshipHub is a comprehensive internship management platform.

## Architecture
- **Client**: React + TypeScript + Vite
- **Server**: Node.js + Express + TypeScript
- **Database ORM**: Prisma + PostgreSQL

## Project Structure
```text
internshiphub/
├── client/          # React frontend (Vite + TS)
├── server/          # Express backend (TS + Prisma)
├── .gitignore
└── README.md
```

## Setup & Running

### Prerequisites
- Node.js (v18+)
- npm
- PostgreSQL

### Backend Setup
```bash
cd server
npm install
# configure .env with DATABASE_URL and PORT
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```
