# nextHermes

A Next.js e-commerce app powered by **Hermes Agent** 🧙‍♂️

Built with: Next.js 16 · Supabase · Vercel · GitHub

---

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend:** Supabase (Auth, Database, SSR)
- **Deployment:** Vercel
- **Source control:** GitHub

## Setup

```bash
# Install dependencies
npm install

# Add environment variables
cp .env.example .env.local
# Fill in your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run development server
npm run dev

# Build for production
npm run build
```

## Features

- Authentication (login, signup, forgot password)
- Product catalog with listing & detail pages
- Cart & wishlist
- User dashboard & profile
- Admin panel (categories, orders, products, users, tenants)
- Dark/light theme toggle

## Vercel Deployment

Set these environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`