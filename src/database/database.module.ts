import { Module, Global, Inject } from '@nestjs/common';
import { Client } from 'pg';
import config from '../config';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

const API_KEY = '12345634';
const API_KEY_PROD = 'PROD1212121SA';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (ConfigService: ConfigType<typeof config>) => {
        // const {
        //   host,
        //   port,
        //   database,
        //   username,
        //   password,
        // } = ConfigService.postgres;
        // return {
        //   type: 'postgres',
        //   host,
        //   port,
        //   database,
        //   username,
        //   password,
        // };
        return {
          type: 'postgres',
          synchronize: true,
          autoLoadEntities: true,
          ...ConfigService.postgres,
        };
      },
    }),
  ],
  providers: [
    {
      provide: 'API_KEY',
      useValue: process.env.NODE_ENV === 'prod' ? API_KEY_PROD : API_KEY,
    },
  ],
  exports: ['API_KEY', TypeOrmModule],
})
export class DatabaseModule {}
