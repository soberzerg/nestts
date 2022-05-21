import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private prefix: string;

  dataSource: DataSource;

  constructor(private configService: ConfigService) {}

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
          ? 'src/**/*.entity.ts'
          : 'dist/**/*.entity{.ts,.js}',
      ];

      this.dataSource = new DataSource({
        type: 'postgres',
        host: this.configService.get<string>('DB_HOST', 'localhost'),
        port: this.configService.get<number>('DB_PORT', 5432),
        username: this.configService.get<string>('DB_USERNAME', 'me'),
        password: this.configService.get<string>('DB_PASSWORD', 'password'),
        database: this.configService.get<string>('DB_DATABASE', 'api'),
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
