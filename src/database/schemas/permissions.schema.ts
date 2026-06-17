import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { commonFields } from './common-fields';
import { roles } from './roles.schema';

export const permissions = pgTable('permissions', {
  ...commonFields,
  action: varchar('action', { length: 50 }).notNull(),
  subject: varchar('subject', { length: 100 }).notNull(),
  conditions: jsonb('conditions'),
  fields: text('fields').array().default([]),
  inverted: boolean('inverted').default(false),
});

export const rolePermissions = pgTable(
  'role_permissions',
  {
    ...commonFields,
    roleId: varchar('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: varchar('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (t) => [
    unique('unique_role_permission').on(t.roleId, t.permissionId),
    index('role_permission_role_id_idx').on(t.roleId),
    index('role_permission_permission_id_idx').on(t.permissionId),
  ],
);
