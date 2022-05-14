import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private prefix: string;

  dataSource: DataSource;

  async initTest(name: string, tables: string[]): Promise<void> {
    this.prefix = `test_${name}_`;

    await this.onModuleInit();

    await Promise.all(
      tables.map((table) =>
        this.dataSource.query(
          `TRUNCATE "test_${name}_${table}" RESTART IDENTITY CASCADE`,
        ),
      ),
    );
  }

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
        port: 54321,
        username: 'me',
        password: 'password',
        database: 'api',
        entities,
        synchronize: true,
        entityPrefix: this.prefix,
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
