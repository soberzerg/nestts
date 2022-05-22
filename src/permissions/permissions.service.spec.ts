import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Action } from '../auth/actions';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { Permission } from './permissions.entity';
import { PermissionsModule } from './permissions.module';
import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
  jest.setTimeout(30000);

  let service: PermissionsService;
  let dbService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, PermissionsModule],
    }).compile();

    dbService = module.get<DatabaseService>(DatabaseService);
    service = module.get<PermissionsService>(PermissionsService);

    await dbService.initTest('permissions', ['permission']);
  });

  it('should create permission', async () => {
    const body = {
      name: 'permission-name',
      action: Action.Create,
      subject: 'permission-subject',
    };

    const permission = await service.create(body);
    expect(permission).toBeInstanceOf(Permission);
    expect(permission.name).toEqual(body.name);
  });

  it('should find all permissions', async () => {
    const permissions = [
      {
        name: 'permission1-name',
        action: Action.Create,
        subject: 'permission1-subject',
      },
      {
        name: 'permission2-name',
        action: Action.Update,
        subject: 'permission2-subject',
      },
    ];

    const permissions1 = await Promise.all(
      permissions.map((body) => Permission.fromPlain(body).save()),
    );
    expect(permissions1[0].name).toEqual(permissions[0].name);

    const permissions2 = await service.findAll();
    expect(permissions2.total).toEqual(permissions.length);
    expect(permissions2.results).toHaveLength(permissions.length);
    expect(permissions2.results).toEqual(expect.arrayContaining(permissions1));
  });

  it('should find one permission', async () => {
    const body = {
      name: 'permission1-name',
      action: Action.Create,
      subject: 'permission1-subject',
    };
    const permission = await Permission.fromPlain(body).save();

    const permission1 = await service.findOne(permission.id);
    expect(permission1).toBeInstanceOf(Permission);
    expect(permission1.name).toEqual(body.name);
  });

  it('should update permission name', async () => {
    const body = {
      name: 'permission1-name',
      action: Action.Delete,
      subject: 'permission1-subject',
    };
    const permission = await Permission.fromPlain(body).save();

    const body1 = {
      name: 'permission2-name',
    };
    const permission1 = await service.update(permission, body1);

    expect(permission1).toBeInstanceOf(Permission);
    expect(permission1.name).toEqual(body1.name);
  });

  it('should remove permission', async () => {
    const body = {
      name: 'permission1-name',
      action: Action.Read,
      subject: 'permission1-subject',
    };
    const permission = await Permission.fromPlain(body).save();

    const permission1 = await service.remove(permission);

    expect(permission1).toBeInstanceOf(Permission);
    expect(permission1.name).toEqual(body.name);
    expect(permission1.deletedAt).toBeTruthy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
