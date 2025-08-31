# iDoEasy Frontend

## Environment Variables

This project requires the following environment variables to be configured:

### NextAuth Configuration
- `NEXTAUTH_SECRET` - Secret key for NextAuth.js (required)
- `NEXTAUTH_TRUST_HOST` - **What it does**: Tells NextAuth to trust the current host URL. **Why needed**: In production (AWS Amplify), NextAuth blocks requests from "untrusted" hosts to prevent CSRF attacks. Setting this to `true` allows the app to work in production. **Default**: `false` (safer for development)

### Backend API Configuration
- `BACKEND_URL` - URL of your backend API (required)

### Development Configuration
- `NODE_ENV` - Environment mode: `development`, `production`, `test` (default: `development`)

## Setup Instructions

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your environment variables in `.env.local`

3. For production (AWS Amplify), set:
   ```bash
   NEXTAUTH_TRUST_HOST=true
   ```

## Development

```bash
npm install
npm run dev
```

## Production

The application is configured for AWS Amplify deployment with proper environment variable handling.
