import type { SessionRow, UserRow } from '../db/index.js';

export type SessionVariables = {
  user: UserRow | null;
  session: SessionRow | null;
};
