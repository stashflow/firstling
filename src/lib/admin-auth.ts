import { headers } from "next/headers";
import { notFound } from "next/navigation";

export async function requireAdminAccess() {
  const username = process.env.ADMIN_BASIC_USER;
  const password = process.env.ADMIN_BASIC_PASSWORD;

  if (!username || !password) {
    return;
  }

  const headerStore = await headers();
  const authorization = headerStore.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    notFound();
  }

  const decoded = Buffer.from(authorization.slice(6), "base64").toString(
    "utf8",
  );

  if (decoded !== `${username}:${password}`) {
    notFound();
  }
}
