import { getSession } from "./session";

export async function getCurrentUser() {
  const session = await getSession();
  return session;
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

export async function isAdmin() {
  const session = await getSession();
  return session?.role === "ADMIN";
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  if (session.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return session;
}
