import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization as organizationPlugin } from 'better-auth/plugins';
import { db } from './db/index.js';
import { organization, member } from '@repo/database/schema';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? 'captionlint-dev-secret-change-in-production',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:4000',
  trustedOrigins: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const orgId = crypto.randomUUID();
          const orgName = user.name?.trim() || (user.email.split('@')[0] ?? user.email);
          await db.insert(organization).values({
            id: orgId,
            name: orgName,
            slug: orgId,
            createdAt: new Date(),
          });
          await db.insert(member).values({
            id: crypto.randomUUID(),
            organizationId: orgId,
            userId: user.id,
            role: 'owner',
            createdAt: new Date(),
          });
        },
      },
    },
  },
  plugins: [organizationPlugin()],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
