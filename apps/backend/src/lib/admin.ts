import type { UserRow } from '../db/index.js';

export function isAdmin(user: UserRow | null): boolean {
  if (!user) {
    return false;
  }
  const configured = process.env.ADMIN_EMAILS;
  if (!configured) {
    return false;
  }
  const allowed = configured
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);
  if (allowed.length === 0) {
    return false;
  }
  return allowed.includes(user.email.trim().toLowerCase());
}
