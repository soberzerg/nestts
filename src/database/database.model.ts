import { BaseEntity } from 'typeorm';
import {
  ClassTransformOptions,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';

export class DatabaseModel extends BaseEntity {
  toPlain(options?: ClassTransformOptions): Record<string, any> {
    return instanceToPlain(this, options);
  }

  static fromPlain<T, V>(
    this: {
      new (): T;
    } & typeof DatabaseModel,
    plain: V,
    options?: ClassTransformOptions,
  ): DatabaseModel {
    return plainToInstance(this, plain, options);
  }
}
