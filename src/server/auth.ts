import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  type TokenSet,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { sendWelcomeEmail } from "~/emails";
import { getUserProfileImage } from "./mattermost/image";
import type { UserPermissionRole } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: UserPermissionRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserPermissionRole;
    blocked?: boolean;
  }
}

interface MattermostProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    signIn({ user }) {
      return !user.blocked;
    },
    session({ session, user }) {
      if (session.user) {
        session.user.image = null;
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    {
      id: "mattermost",
      name: "Mattermost",
      type: "oauth",
      version: "2.0",
      authorization: `${env.MATTERMOST_URL}/oauth/authorize`,
      token: {
        async request(context) {
          const response = await fetch(
            `${env.MATTERMOST_URL}/oauth/access_token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                ...context.params,
                client_id: context.provider.clientId ?? "",
                client_secret: context.provider.clientSecret ?? "",
                redirect_uri: context.provider.callbackUrl,
                grant_type: "authorization_code",
              }),
            }
          );

          const tokens = (await response.json()) as TokenSet;

          return { tokens };
        },
      },
      userinfo: `${env.MATTERMOST_URL}/api/v4/users/me`,
      profile(profile: MattermostProfile) {
        return {
          id: profile.id,
          email: profile.email,
          name: `${profile.first_name} ${profile.last_name}`,
          role: "USER",
        };
      },
      clientId: env.MATTERMOST_CLIENT_ID,
      clientSecret: env.MATTERMOST_CLIENT_SECRET,
      style: {
        logo: "/mattermost.svg",
        logoDark: "/mattermost.svg",
        bg: "#fff",
        text: "#000",
        bgDark: "#fff",
        textDark: "#000",
      },
    },
  ],
  events: {
    async createUser({ user }) {
      if (user.email && user.name) {
        await sendWelcomeEmail({ to: user.email, name: user.name });
      }
    },
    async linkAccount({ user, profile }) {
      const image = await getUserProfileImage(profile.id);
      await prisma.user.update({ where: { id: user.id }, data: { image } });
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
