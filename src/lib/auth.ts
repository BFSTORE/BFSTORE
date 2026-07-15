import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "bfstore-dev-secret");
const COOKIE = "bf_session";

export type Session = {
  uid: number;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};

export async function createSession(session: Session) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("UNAUTHORIZED");
  return session;
}
