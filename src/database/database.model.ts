import { BaseEntity } from 'typeorm';
import {
  ClassTransformOptions,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';

export class DatabaseModel extends BaseEntity {
  toPlain(options?: ClassTransformOptions): Record<string, any> {
    return instanceToPlain(this, { ...options, excludePrefixes: ['__'] });
  }

  static toPlain<T>(
    object: T,
    options?: ClassTransformOptions,
  ): Record<string, any> {
    return instanceToPlain(object, { ...options, excludePrefixes: ['__'] });
  }

  static fromPlain<T extends DatabaseModel, V>(
    this: {
      new (): T;
    } & typeof DatabaseModel,
    plain: V,
    options?: ClassTransformOptions,
  ): T {
    return plainToInstance(this, plain, options) as T;
  }
}
