import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { USER_ROLES } from '../../constants';
import { commonFields } from './common-fields';

export const roles = pgTable('roles', {
  ...commonFields,
  role: varchar('role', { length: 20, enum: USER_ROLES }).notNull().unique(),
});
