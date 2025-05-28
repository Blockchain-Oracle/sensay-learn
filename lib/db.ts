// Use server-only directive to ensure this is only used on the server
import "server-only"

// Import PrismaClient 
// This syntax ensures compatibility with different versions of Prisma
// @ts-ignore - For TypeScript users
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure this is not being executed on the client-side
if (typeof window !== "undefined") {
  throw new Error("PrismaClient should not be used on the client side!")
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
