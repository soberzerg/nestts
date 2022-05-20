import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/users.entity';
import { Role } from './roles.entity';
import { Permission } from '../actions/permissions.entity';
import { Action } from '../auth/actions';
import { DatabaseModule } from '../database/database.module';

describe('RolesController', () => {
  jest.setTimeout(30000);

  let app: INestApplication;
  let jwtService: JwtService;
  let rolesService: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), AuthModule, DatabaseModule],
      controllers: [RolesController],
      providers: [RolesService],
    }).compile();

    app = module.createNestApplication();
    app.enableShutdownHooks();
    await app.init();

    jwtService = module.get<JwtService>(JwtService);
    rolesService = module.get<RolesService>(RolesService);
  });

  it(`/GET /roles by SuperAdmin`, () => {
    const user = new User();
    user.id = 1;
    user.login = 'admin@user.com';
    user.password = 'qwe123';
    user.isSuperAdmin = true;

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    const role = new Role();
    role.id = 1;
    role.name = 'role-name';

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest
      .spyOn(rolesService, 'findAll')
      .mockResolvedValue({ total: 1, results: [role] });

    return request(app.getHttpServer())
      .get('/roles')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect({ total: 1, take: 10, skip: 0, results: [role.toPlain()] });
  });

  it(`/GET /roles by any user`, () => {
    const user = new User();
    user.id = 2;
    user.login = 'user2@user.com';
    user.password = 'qwe123';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    const role = new Role();
    role.id = 1;
    role.name = 'role-name';

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);

    return request(app.getHttpServer())
      .get('/roles')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/GET /roles by user with read permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Read,
      subject: 'Role',
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
      .get('/roles')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/GET /roles by user with list permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.List,
      subject: 'Role',
    });

    const role = new Role();
    role.permissions = [permission];

    const role2 = new Role();
    role2.permissions = [permission];

    const user = new User();
    user.id = 4;
    user.login = 'user4@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest
      .spyOn(rolesService, 'findAll')
      .mockResolvedValue({ total: 2, results: [role, role2] });

    return request(app.getHttpServer())
      .get('/roles')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect({
        total: 2,
        take: 10,
        skip: 0,
        results: [role.toPlain(), role2.toPlain()],
      });
  });

  it(`/GET /roles/:id by user with read permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Read,
      subject: 'Role',
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
    jest.spyOn(Role, 'findOneBy').mockResolvedValue(role);

    return request(app.getHttpServer())
      .get(`/roles/${role.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect({ role: role.toPlain() });
  });

  it(`/POST /roles by user without create permission`, () => {
    const user = new User();
    user.id = 5;
    user.login = 'user5@user.com';
    user.password = 'qwe123';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);

    const newRole = {
      name: 'role-name',
    };

    return request(app.getHttpServer())
      .post(`/roles`)
      .send(newRole)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/POST /roles by user with create permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Create,
      subject: 'Role',
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

    const newRole = new Role();
    newRole.name = 'new-role';

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(rolesService, 'create').mockResolvedValue(newRole);

    return request(app.getHttpServer())
      .post(`/roles`)
      .send(newRole.toPlain())
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({
          role: expect.objectContaining({ name: newRole.name }),
        });
      });
  });

  it(`/PATCH /roles/:id by user without update permission`, () => {
    const user = new User();
    user.id = 7;
    user.login = 'user7@user.com';
    user.password = 'qwe123';

    const access_token = jwtService.sign({ sub: user.id });

    const role = new Role();
    role.id = 1;
    role.name = 'role-name';

    const newRoleName = 'role-new-name';

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(rolesService, 'findOne').mockResolvedValue(role);
    jest.spyOn(role, 'save').mockResolvedValue(role);

    return request(app.getHttpServer())
      .patch(`/roles/${role.id}`)
      .send({ name: newRoleName })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/PATCH /roles/:id by user with global update permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Update,
      subject: 'Role',
    });

    const role = new Role();
    role.permissions = [permission];

    const user = new User();
    user.id = 8;
    user.login = 'user8@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);

    const role2 = new Role();
    role2.id = 8;
    role2.name = 'role-name';

    const access_token = jwtService.sign({ sub: user.id });

    const newName = 'role-new-name';

    jest.spyOn(User, 'findOneBy').mockResolvedValueOnce(user);
    jest.spyOn(rolesService, 'findOne').mockResolvedValueOnce(role2);
    jest.spyOn(role2, 'save').mockResolvedValue(role2);

    return request(app.getHttpServer())
      .patch(`/roles/${role2.id}`)
      .send({ name: newName })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          role: expect.objectContaining({ id: role2.id, name: newName }),
        });
      });
  });

  it(`/DELETE /roles/:id by user without delete permission`, () => {
    const user = new User();
    user.id = 10;
    user.login = 'user7@user.com';
    user.password = 'qwe123';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    const role = new Role();
    role.id = 1;
    role.name = 'role-name';

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(rolesService, 'findOne').mockResolvedValue(role);

    return request(app.getHttpServer())
      .delete(`/roles/${role.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/DELETE /roles/:id by user with global delete permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Delete,
      subject: 'Role',
    });

    const role = new Role();
    role.permissions = [permission];

    const user = new User();
    user.id = 11;
    user.login = 'user11@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);

    const role2 = new Role();
    role2.id = 12;
    role2.name = 'role-name';

    const access_token = jwtService.sign({ sub: user.id });

    jest.spyOn(User, 'findOneBy').mockResolvedValueOnce(user);
    jest.spyOn(Role, 'findOneBy').mockResolvedValueOnce(role2);
    jest.spyOn(role2, 'softRemove').mockImplementation(async () => {
      role2.deletedAt = new Date();
      return role2;
    });

    return request(app.getHttpServer())
      .delete(`/roles/${role2.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          role: JSON.parse(JSON.stringify(role2.toPlain())),
        });
        expect(res.body.role.deletedAt).toBeTruthy();
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
