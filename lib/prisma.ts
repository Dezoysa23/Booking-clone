import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Neon serverless driver adapter. Connections run over a secure WebSocket to
// Neon's proxy instead of a raw TCP socket, so Neon reaping idle connections no
// longer surfaces as `prisma:error ... ConnectionReset (10054)` noise and cold
// starts reconnect gracefully. In Node 24 the driver auto-uses the global
// WebSocket, so no `ws` package or neonConfig setup is required.
function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
