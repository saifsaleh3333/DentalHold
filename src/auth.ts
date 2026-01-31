import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "DentalHold <noreply@dentalhold.com>",
      async sendVerificationRequest({ identifier: email, url }) {
        const { Resend: ResendClient } = await import("resend");
        const resend = new ResendClient(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: process.env.EMAIL_FROM || "DentalHold <noreply@dentalhold.com>",
          to: email,
          subject: "Sign in to DentalHold",
          html: `
            <div style="max-width: 480px; margin: 0 auto; font-family: sans-serif;">
              <h2 style="color: #0ea5e9; margin-bottom: 24px;">DentalHold</h2>
              <p style="color: #334155; font-size: 16px;">Click the button below to sign in to your DentalHold account.</p>
              <a href="${url}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">Sign In</a>
              <p style="color: #94a3b8; font-size: 14px;">If you didn&apos;t request this email, you can safely ignore it.</p>
            </div>
          `,
        });
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=true",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      // Reject users not in the database or without a practice
      if (!dbUser || !dbUser.practiceId) return false;

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { practice: true },
        });

        session.user.id = user.id;
        session.user.role = dbUser?.role || "staff";
        session.user.practiceId = dbUser?.practiceId || "";
        session.user.practiceName = dbUser?.practice?.name || "";
      }
      return session;
    },
  },
});
