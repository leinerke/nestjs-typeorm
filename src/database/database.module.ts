import { Module, Global, Inject } from '@nestjs/common';
import { Client } from 'pg';
import config from '../config';
import { ConfigType } from '@nestjs/config';

const API_KEY = '12345634';
const API_KEY_PROD = 'PROD1212121SA';

@Global()
@Module({
  providers: [
    {
      provide: 'API_KEY',
      useValue: process.env.NODE_ENV === 'prod' ? API_KEY_PROD : API_KEY,
    },
    {
      provide: 'PG',
      useFactory: (ConfigService: ConfigType<typeof config>) => {
        const { host, port, database, user, password } = ConfigService.postgres;
        const client = new Client({
          host,
          port,
          database,
          user,
          password,
        });
        client.connect();
        return client;
      },
      inject: [config.KEY],
    },
  ],
  exports: ['API_KEY', 'PG'],
})
export class DatabaseModule {}
