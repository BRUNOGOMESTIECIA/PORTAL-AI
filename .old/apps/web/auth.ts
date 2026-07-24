import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantSlug: { label: "Tenant Slug", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.tenantSlug) {
          return null
        }
        
        // Aqui chamaremos a API FastAPI para validar o usuário
        // const res = await fetch("http://localhost:8000/api/v1/auth/login", { ... })
        // Para a fase 1 mockada (enquanto não implementamos o auth backend completo):
        
        if (credentials.email === "admin@test.com" && credentials.password === "123") {
          return {
            id: "1",
            name: "Admin User",
            email: "admin@test.com",
            tenant_slug: credentials.tenantSlug
          }
        }
        
        return null
      },
    }),
  ],
  pages: {
    // Definiremos as páginas de erro ou signIn se necessário no futuro
    // signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenant_slug = (user as any).tenant_slug
      }
      return token
    },
    async session({ session, token }) {
      if (token.tenant_slug) {
        (session as any).tenant_slug = token.tenant_slug
      }
      return session
    }
  }
})
