import { pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './common-fields';
import { roles } from './roles.schema';

export const users = pgTable('users', {
  ...commonFields,
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  roleId: varchar('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  password: text('password').notNull(),
});
