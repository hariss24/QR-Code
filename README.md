# QRGen Internal Clone

Clone SaaS inspiré de app.qr-code-generator.com construit avec **Next.js 14 + TypeScript + Tailwind + Prisma + NextAuth**.

## Démarrage
1. `npm install`
2. `cp .env.example .env`
3. `docker-compose up -d db`
4. `npx prisma migrate dev`
5. `npx prisma db seed`
6. `npm run dev`

## Comptes seed
- `admin@qrgen.local` / `password123`
- `user@qrgen.local` / `password123`

## Fonctionnalités incluses
- Pages publiques (landing, login, signup, pricing)
- Dashboard (overview, create wizard, qrcodes, folders, bulk, settings)
- Prisma schema complet (users, qrcodes, scans, folders, team)
- API routes REST avec validation Zod
- Route `/r/[shortCode]` pour tracking + redirection
- Seed data réaliste (dossiers, qrcodes, scans)

## Notes
Ce socle est prêt pour extension (charts avancés, upload S3, team permissions, billing réel, templates dynamiques complets).
