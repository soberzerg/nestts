import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { UsersModule } from './users.module';

describe('UsersService', () => {
  let service: UsersService;
  let dbService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, UsersModule],
    }).compile();

    dbService = module.get<DatabaseService>(DatabaseService);
    service = module.get<UsersService>(UsersService);

    await dbService.initTest('users', ['user', 'role', 'permission']);
  });

  it('should create user', async () => {
    const body = {
      login: 'abc@user.com',
      password: 'qwe123',
    };

    const user = await service.create(body);
    expect(user).toBeInstanceOf(User);
    expect(user.login).toEqual(body.login);
    await expect(
      User.comparePassword(body.password, user.hashedPassword),
    ).resolves.toBeTruthy();
  });

  it('should find all users', async () => {
    const users = [
      {
        login: 'user1@user.com',
        password: 'qwe1',
      },
      {
        login: 'user2@user.com',
        password: 'qwe2',
      },
    ];

    const users1 = await Promise.all(
      users.map((body) => User.fromPlain(body).save()),
    );
    expect(users1[0].login).toEqual(users[0].login);
    expect(users1[0].password).toBeUndefined();
    await expect(
      User.comparePassword(users[0].password, users1[0].hashedPassword),
    ).resolves.toBeTruthy();

    const users2 = await service.findAll();
    expect(users2).toHaveLength(users.length);
    expect(users2).toEqual(expect.arrayContaining(users1));
  });

  it('should find one user', async () => {
    const body = {
      login: 'abc@user.com',
      password: 'qwe123',
    };
    const user = await User.fromPlain(body).save();

    const user1 = await service.findOne(user.id);
    expect(user1).toBeInstanceOf(User);
    expect(user1.login).toEqual(body.login);
    await expect(
      User.comparePassword(body.password, user1.hashedPassword),
    ).resolves.toBeTruthy();
  });

  it('should update user login', async () => {
    const body = {
      login: 'abc@user.com',
      password: 'qwe123',
    };
    const user = await User.fromPlain(body).save();

    const body1 = {
      login: 'abc2@user.com',
    };
    const user1 = await service.update(user, body1);

    expect(user1).toBeInstanceOf(User);
    expect(user1.login).toEqual(body1.login);
    await expect(
      User.comparePassword(body.password, user1.hashedPassword),
    ).resolves.toBeTruthy();
  });

  it('should update user pasword', async () => {
    const body = {
      login: 'abc@user.com',
      password: 'qwe123',
    };
    const user = await User.fromPlain(body).save();

    const body1 = {
      password: 'qwe456',
    };
    const user1 = await service.update(user, body1);

    expect(user1).toBeInstanceOf(User);
    expect(user1.login).toEqual(body.login);
    await expect(
      User.comparePassword(body1.password, user1.hashedPassword),
    ).resolves.toBeTruthy();
  });

  it('should remove user', async () => {
    const body = {
      login: 'abc@user.com',
      password: 'qwe123',
    };
    const user = await User.fromPlain(body).save();

    const user1 = await service.remove(user);

    expect(user1).toBeInstanceOf(User);
    expect(user1.login).toEqual(body.login);
    expect(user1.deletedAt).toBeTruthy();
    await expect(
      User.comparePassword(body.password, user1.hashedPassword),
    ).resolves.toBeTruthy();
  });

  afterEach(async () => {
    await dbService.onModuleDestroy();
  });
});
