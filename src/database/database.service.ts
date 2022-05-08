import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  dataSource: DataSource;

  async onApplicationBootstrap(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 54320,
        username: 'me',
        password: 'password',
        database: 'api',
        entities: ['**/*.entity.ts'],
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
