import type { User } from "@prisma/client";

/** Platform administrators — both legacy ADMIN and new SUPER_ADMIN are treated as admins. */
export function isSuperAdmin(user: User | null): boolean {
  return user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
}

export function isHost(user: User | null): boolean {
  return user?.role === "HOST";
}

export function isUser(user: User | null): boolean {
  return user?.role === "USER";
}

/** Hosts OR super admins can access host-level resources (super admin has full access). */
export function isHostOrAdmin(user: User | null): boolean {
  return isHost(user) || isSuperAdmin(user);
}

export function roleLabel(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "Super Admin";
    case "HOST":
      return "Host";
    default:
      return "Member";
  }
}
