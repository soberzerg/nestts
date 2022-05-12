import { Test, TestingModule } from '@nestjs/testing';
import { Ability } from '@casl/ability';
import { AuthService } from './auth.service';
import { Role } from './roles.entity';
import { Permission } from './permissions.entity';
import { Action } from './actions';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { User } from '../users/users.entity';

describe('AuthService', () => {
  let service: AuthService;
  let dbService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [AuthService, DatabaseService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    dbService = module.get<DatabaseService>(DatabaseService);

    await dbService.onApplicationBootstrap();

    await dbService.dataSource.query('TRUNCATE "user" CASCADE');
    await dbService.dataSource.query('TRUNCATE "role" CASCADE');
    await dbService.dataSource.query('TRUNCATE "permission" CASCADE');
  });

  it('should validate user', async () => {
    const body = {
      login: 'abc@user.com',
      password: 'qwe123',
    };
    await User.fromPlain(body).save();

    const invalidUser = await service.validateUser(body.login, 'wrong-pass');
    expect(invalidUser).toBeFalsy();

    const user = await service.validateUser(body.login, body.password);
    expect(user).toBeInstanceOf(User);
    expect(user.login).toEqual(body.login);
    await expect(
      User.comparePassword(body.password, user.hashedPassword),
    ).resolves.toBeTruthy();
  });

  it('should get user by id', async () => {
    const permission = Permission.fromPlain({
      name: 'permission1',
      action: Action.Update,
      subject: 'User',
      ownerField: 'id',
    });
    await permission.save();

    const role = new Role();
    role.name = 'role1';
    role.permissions = [permission];
    await role.save();

    const user = new User();
    user.login = 'abc@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);
    await user.save();
    expect(user.id).toBeTruthy();

    const userFound = await service.getUser(user.id);
    expect(userFound).toBeInstanceOf(User);
    expect(userFound.login).toEqual(user.login);
    expect(userFound.roles).resolves.toEqual([role]);
    expect(userFound.ability).toBeInstanceOf(Ability);
  });

  it('should get superadmin user by id', async () => {
    const permission = Permission.fromPlain({
      name: 'permission1',
      action: Action.Update,
      subject: 'User',
      ownerField: 'id',
    });
    await permission.save();

    const role = new Role();
    role.name = 'role1';
    role.permissions = [permission];
    await role.save();

    const user = new User();
    user.login = 'abc@user.com';
    user.password = 'qwe123';
    user.isSuperAdmin = true;
    user.roles = Promise.resolve([role]);
    await user.save();
    expect(user.id).toBeTruthy();

    const userFound = await service.getUser(user.id);
    expect(userFound).toBeInstanceOf(User);
    expect(userFound.login).toEqual(user.login);
    expect(userFound.roles).resolves.toEqual([role]);
    expect(userFound.isSuperAdmin).toBe(true);
    expect(userFound.ability).toBeInstanceOf(Ability);
  });

  afterEach(async () => {
    await dbService.onModuleDestroy();
  });
});
