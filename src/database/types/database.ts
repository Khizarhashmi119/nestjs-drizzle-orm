import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schemas from '../schemas';

export type Database = NodePgDatabase<typeof schemas>;
