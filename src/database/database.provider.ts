import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DB_PROVIDER } from 'src/constants';
import * as schemas from './schemas';

export const DatabaseProvider: Provider = {
  provide: DB_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const pool = new Pool({
      connectionString: configService.get('DATABASE_URL'),
    });

    const db = drizzle(pool, {
      schema: {
        ...schemas,
      },
    });

    return db;
  },
};
