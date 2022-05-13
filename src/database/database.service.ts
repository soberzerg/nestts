import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  dataSource: DataSource;

  async onModuleInit(): Promise<void> {
    return new Promise((resolve, reject) => {
      const entities = [
        process.env.NODE_ENV === 'test'
          ? '**/*.entity{.ts,.js}'
          : 'dist/**/*.entity{.ts,.js}',
      ];

      this.dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 54320,
        username: 'me',
        password: 'password',
        database: 'api',
        entities,
        synchronize: true,
      });

      this.dataSource
        .initialize()
        .then(() => {
          // here you can start to work with your database
          resolve();
        })
        .catch((error) => {
          console.error(error);
          reject();
        });
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.dataSource.destroy();
  }
}
