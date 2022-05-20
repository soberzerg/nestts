import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { Role } from '../roles/roles.entity';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { RolesModule } from './roles.module';

describe('RolesService', () => {
  jest.setTimeout(30000);

  let service: RolesService;
  let dbService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, RolesModule],
    }).compile();

    dbService = module.get<DatabaseService>(DatabaseService);
    service = module.get<RolesService>(RolesService);

    await dbService.initTest('roles', ['role', 'permission']);
  });

  it('should create role', async () => {
    const body = {
      name: 'role-name',
    };

    const role = await service.create(body);
    expect(role).toBeInstanceOf(Role);
    expect(role.name).toEqual(body.name);
  });

  it('should find all roles', async () => {
    const roles = [
      {
        name: 'role1-name',
        permissions: [],
      },
      {
        name: 'role2-name',
        permissions: [],
      },
    ];

    const roles1 = await Promise.all(
      roles.map((body) => Role.fromPlain(body).save()),
    );
    expect(roles1[0].name).toEqual(roles[0].name);

    const roles2 = await service.findAll();
    expect(roles2.total).toEqual(roles.length);
    expect(roles2.results).toHaveLength(roles.length);
    expect(roles2.results).toEqual(expect.arrayContaining(roles1));
  });

  it('should find one role', async () => {
    const body = {
      name: 'role1-name',
    };
    const role = await Role.fromPlain(body).save();

    const role1 = await service.findOne(role.id);
    expect(role1).toBeInstanceOf(Role);
    expect(role1.name).toEqual(body.name);
  });

  it('should update role name', async () => {
    const body = {
      name: 'role1-name',
    };
    const role = await Role.fromPlain(body).save();

    const body1 = {
      name: 'role2-name',
    };
    const role1 = await service.update(role, body1);

    expect(role1).toBeInstanceOf(Role);
    expect(role1.name).toEqual(body1.name);
  });

  it('should remove role', async () => {
    const body = {
      name: 'role1-name',
    };
    const role = await Role.fromPlain(body).save();

    const role1 = await service.remove(role);

    expect(role1).toBeInstanceOf(Role);
    expect(role1.name).toEqual(body.name);
    expect(role1.deletedAt).toBeTruthy();
  });

  afterEach(async () => {
    await dbService.onModuleDestroy();
  });
});
