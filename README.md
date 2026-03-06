This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



Notes

The code is ready for multiple users — the main thing left is deploying it so other people can reach it, and swapping SQLite for a hosted database.

Here's the full path:

Step 1 — Switch the database from SQLite to Postgres
SQLite is a local file — it only works on one machine. For a shared deployment you need a hosted database. Neon has a free Postgres tier that works well.

Create a free account at neon.tech, create a project, copy the connection string
Change one line in prisma/schema.prisma:

- provider = "sqlite"
+ provider = "postgresql"
In your production env vars, set DATABASE_URL to the Neon connection string
That's the only code change needed — Prisma handles the rest.

Step 2 — Deploy to Railway (easiest option)
Push your repo to GitHub
Go to railway.app → New Project → Deploy from GitHub repo
Add all your env vars in Railway's dashboard:

ANTHROPIC_API_KEY=
NEXTAUTH_SECRET=         # openssl rand -base64 32
NEXTAUTH_URL=https://your-app.railway.app
DATABASE_URL=            # from Neon
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://your-app.railway.app/api/auth/gmail/callback
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_REDIRECT_URI=https://your-app.railway.app/api/auth/outlook/callback
Railway will run npm run build && npm start automatically
Step 3 — Update OAuth redirect URIs
Once you have your production URL, add it to both OAuth apps:

Google Cloud Console → Your OAuth app → Authorized redirect URIs → add:


https://your-app.railway.app/api/auth/callback/google
https://your-app.railway.app/api/auth/gmail/callback
Azure Portal → App Registration → Authentication → add:


https://your-app.railway.app/api/auth/outlook/callback
Step 4 — Run migrations on the production DB
After first deploy, run once to create the tables:


DATABASE_URL=<neon-url> npx prisma db push
Or you can do this from Railway's shell.

That's it. Once deployed, anyone with the URL can sign in with their Google account and get their own isolated writing samples and email connections.