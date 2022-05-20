import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { User } from './users.entity';
import { Role } from '../roles/roles.entity';
import { Permission } from '../actions/permissions.entity';
import { Action } from '../auth/actions';
import { DatabaseModule } from '../database/database.module';

describe('UsersController', () => {
  jest.setTimeout(30000);

  let app: INestApplication;
  let jwtService: JwtService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), AuthModule, DatabaseModule],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    app = module.createNestApplication();
    app.enableShutdownHooks();
    await app.init();

    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  it(`/GET /users by SuperAdmin`, () => {
    const user = new User();
    user.id = 1;
    user.login = 'admin@user.com';
    user.password = 'qwe123';
    user.isSuperAdmin = true;

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest
      .spyOn(usersService, 'findAll')
      .mockResolvedValue({ total: 1, results: [user] });

    return request(app.getHttpServer())
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect({ total: 1, take: 10, skip: 0, results: [user.toPlain()] });
  });

  it(`/GET /users by any user`, () => {
    const user = new User();
    user.id = 2;
    user.login = 'user2@user.com';
    user.password = 'qwe123';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);

    return request(app.getHttpServer())
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/GET /users by user with read permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Read,
      subject: 'User',
      ownerField: 'id',
    });

    const role = new Role();
    role.permissions = [permission];

    const user = new User();
    user.id = 3;
    user.login = 'user3@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);

    return request(app.getHttpServer())
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/GET /users by user with list permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.List,
      subject: 'User',
    });

    const role = new Role();
    role.permissions = [permission];

    const user = new User();
    user.id = 4;
    user.login = 'user4@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);

    const user2 = new User();
    user2.id = 5;
    user2.login = 'user5@user.com';
    user2.password = 'qwe123';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest
      .spyOn(usersService, 'findAll')
      .mockResolvedValue({ total: 2, results: [user, user2] });

    return request(app.getHttpServer())
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect({
        total: 2,
        take: 10,
        skip: 0,
        results: [user.toPlain(), user2.toPlain()],
      });
  });

  it(`/GET /users/:id by user with read permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Read,
      subject: 'User',
      ownerField: 'id',
    });

    const role = new Role();
    role.permissions = [permission];

    const user = new User();
    user.id = 5;
    user.login = 'user5@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);

    return request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect({ user: user.toPlain() });
  });

  it(`/POST /users by user without create permission`, () => {
    const user = new User();
    user.id = 5;
    user.login = 'user5@user.com';
    user.password = 'qwe123';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);

    const newUser = {
      login: 'new-user@user.com',
      password: 'qwe456',
    };

    return request(app.getHttpServer())
      .post(`/users`)
      .send(newUser)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/POST /users by user with create permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Create,
      subject: 'User',
    });

    const role = new Role();
    role.permissions = [permission];

    const user = new User();
    user.id = 6;
    user.login = 'user6@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    const newUser = new User();
    newUser.login = 'new-user2@user.com';
    newUser.password = 'qwe456';

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(usersService, 'create').mockResolvedValue(newUser);

    return request(app.getHttpServer())
      .post(`/users`)
      .send(newUser.toPlain())
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({
          user: expect.objectContaining({ login: newUser.login }),
        });
        expect(res.body.user.password).toBeUndefined();
      });
  });

  it(`/PATCH /users/:id by user without update permission`, () => {
    const user = new User();
    user.id = 7;
    user.login = 'user7@user.com';
    user.password = 'qwe123';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    const newLogin = 'user7@new-login.com';

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(user, 'save').mockResolvedValue(user);

    return request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .send({ login: newLogin })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/PATCH /users/:id by user with global update permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Update,
      subject: 'User',
    });

    const role = new Role();
    role.permissions = [permission];

    const user = new User();
    user.id = 8;
    user.login = 'user8@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);

    const user2 = new User();
    user2.id = 81;
    user2.login = 'user81@user.com';
    user2.password = 'qwe453';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    const newLogin = 'user8@new-login.com';

    jest.spyOn(User, 'findOneBy').mockResolvedValueOnce(user);
    jest.spyOn(User, 'findOneBy').mockResolvedValueOnce(user2);
    jest.spyOn(user2, 'save').mockResolvedValue(user2);

    return request(app.getHttpServer())
      .patch(`/users/${user2.id}`)
      .send({ login: newLogin })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          user: expect.objectContaining({ id: user2.id, login: newLogin }),
        });
      });
  });

  it(`/PATCH /users/:id by user with self update permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Update,
      subject: 'User',
      ownerField: 'id',
    });

    const role = new Role();
    role.permissions = [permission];

    const user = new User();
    user.id = 9;
    user.login = 'user9@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    const newLogin = 'user9@new-login.com';

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(user, 'save').mockResolvedValue(user);

    return request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .send({ login: newLogin })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          user: expect.objectContaining({ id: 9, login: newLogin }),
        });
      });
  });

  it(`/DELETE /users/:id by user without delete permission`, () => {
    const user = new User();
    user.id = 10;
    user.login = 'user7@user.com';
    user.password = 'qwe123';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);

    return request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/DELETE /users/:id by user with global delete permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Delete,
      subject: 'User',
    });

    const role = new Role();
    role.permissions = [permission];

    const user = new User();
    user.id = 11;
    user.login = 'user11@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);

    const user2 = new User();
    user2.id = 12;
    user2.login = 'user12@user.com';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValueOnce(user);
    jest.spyOn(User, 'findOneBy').mockResolvedValueOnce(user2);
    jest.spyOn(user2, 'softRemove').mockImplementation(async () => {
      user2.deletedAt = new Date();
      return user2;
    });

    return request(app.getHttpServer())
      .delete(`/users/${user2.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          user: JSON.parse(JSON.stringify(user2.toPlain())),
        });
        expect(res.body.user.deletedAt).toBeTruthy();
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
