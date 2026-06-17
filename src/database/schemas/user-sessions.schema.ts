import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { commonFields } from './common-fields';
import { users } from './users.schema';

export const userSessions = pgTable(
  'user_sessions',
  {
    ...commonFields,
    userId: varchar('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    refreshToken: text('refresh_token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 255 }),
    isRevoked: boolean('is_revoked').notNull().default(false),
    revokedAt: timestamp('revoked_at'),
    revokeReason: varchar('revoke_reason', { length: 255 }),
    lastUsedAt: timestamp('last_used_at'),
  },
  (t) => [index('session_user_id_idx').on(t.userId)],
);
