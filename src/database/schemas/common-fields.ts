import { timestamp, varchar } from 'drizzle-orm/pg-core';
import { v7 as uuidV7 } from 'uuid';

export const commonFields = {
  id: varchar('id')
    .$defaultFn(() => uuidV7())
    .primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
};
