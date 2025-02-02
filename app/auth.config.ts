import GitHub from "next-auth/providers/github"
import NextAuth, { NextAuthOptions } from "next-auth"

const clientId = process.env.GITHUB_ID;
const clientSecret = process.env.GITHUB_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("Missing GitHub Client ID or Secret in environment variables");
}

export const authConfig: NextAuthOptions = {
  providers: [
    GitHub({
      clientId: clientId,
      clientSecret: clientSecret,
      authorization: {
        params: {
          // Request access to repos and user data
          scope: 'read:user user:email repo'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
} 