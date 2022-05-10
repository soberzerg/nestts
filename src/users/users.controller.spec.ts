import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/users.entity';
import { Role } from '../auth/roles.entity';
import { Permission } from '../auth/permissions.entity';
import { Action } from '../auth/actions';

describe('UsersController', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);

    app = module.createNestApplication();
    app.enableShutdownHooks();
    await app.init();
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
    jest.spyOn(usersService, 'findAll').mockResolvedValue([user]);

    return request(app.getHttpServer())
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect([user.toPlain()]);
  });

  it(`/GET /users by any user`, () => {
    const user = new User();
    user.id = 2;
    user.login = 'user2@user.com';
    user.password = 'qwe123';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(usersService, 'findAll').mockResolvedValue([user]);

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
    jest.spyOn(usersService, 'findAll').mockResolvedValue([user]);

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
    jest.spyOn(usersService, 'findAll').mockResolvedValue([user, user2]);

    return request(app.getHttpServer())
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect([user.toPlain(), user2.toPlain()]);
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
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
