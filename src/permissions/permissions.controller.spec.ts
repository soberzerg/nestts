import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { Permission } from './permissions.entity';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { User } from '../users/users.entity';
import { Action } from '../auth/actions';
import { Role } from '../roles/roles.entity';

describe('PermissionsController', () => {
  jest.setTimeout(30000);

  let app: INestApplication;
  let jwtService: JwtService;
  let permissionsService: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), AuthModule, DatabaseModule],
      controllers: [PermissionsController],
      providers: [PermissionsService],
    }).compile();

    app = module.createNestApplication();
    app.enableShutdownHooks();
    await app.init();

    jwtService = module.get<JwtService>(JwtService);
    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  it(`/GET /permissions by SuperAdmin`, () => {
    const user = new User();
    user.id = 1;
    user.login = 'admin@user.com';
    user.password = 'qwe123';
    user.isSuperAdmin = true;

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    const permission = new Permission();
    permission.id = 1;
    permission.name = 'permission-name';
    permission.subject = 'permission-subject';
    permission.action = Action.Create;

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest
      .spyOn(permissionsService, 'findAll')
      .mockResolvedValue({ total: 1, results: [permission] });

    return request(app.getHttpServer())
      .get('/permissions')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect({ total: 1, take: 10, skip: 0, results: [permission.toPlain()] });
  });

  it(`/GET /permissions by any user`, () => {
    const user = new User();
    user.id = 2;
    user.login = 'user2@user.com';
    user.password = 'qwe123';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    const permission = new Permission();
    permission.id = 1;
    permission.name = 'permission-name';
    permission.subject = 'permission-subject';
    permission.action = Action.Create;

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);

    return request(app.getHttpServer())
      .get('/permissions')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/GET /permissions by user with read permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Read,
      subject: 'Permission',
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
      .get('/permissions')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/GET /permissions by user with list permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.List,
      subject: 'Permission',
    });

    const permission2 = Permission.fromPlain({
      action: Action.Create,
      subject: 'Permission2',
    });

    const role = new Role();
    role.permissions = [permission];

    const user = new User();
    user.id = 4;
    user.login = 'user4@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest
      .spyOn(permissionsService, 'findAll')
      .mockResolvedValue({ total: 2, results: [permission, permission2] });

    return request(app.getHttpServer())
      .get('/permissions')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect({
        total: 2,
        take: 10,
        skip: 0,
        results: [permission.toPlain(), permission2.toPlain()],
      });
  });

  it(`/GET /permissions/:id by user with read permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Read,
      subject: 'Permission',
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
    jest.spyOn(Permission, 'findOneBy').mockResolvedValue(permission);

    return request(app.getHttpServer())
      .get(`/permissions/${permission.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect({ permission: permission.toPlain() });
  });

  it(`/POST /permissions by user without create permission`, () => {
    const user = new User();
    user.id = 5;
    user.login = 'user5@user.com';
    user.password = 'qwe123';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);

    const newPermission = {
      name: 'permission-name',
      action: Action.Create,
      subject: 'permission-subject',
    };

    return request(app.getHttpServer())
      .post(`/permissions`)
      .send(newPermission)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/POST /permissions by user with create permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Create,
      subject: 'Permission',
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

    const newPermission = new Permission();
    newPermission.name = 'permission-name';
    newPermission.action = Action.Create;
    newPermission.subject = 'permission-subject';

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(permissionsService, 'create').mockResolvedValue(newPermission);

    return request(app.getHttpServer())
      .post(`/permissions`)
      .send(newPermission.toPlain())
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({
          permission: expect.objectContaining({
            name: newPermission.name,
            action: newPermission.action,
            subject: newPermission.subject,
          }),
        });
      });
  });

  it(`/PATCH /permissions/:id by user without update permission`, () => {
    const user = new User();
    user.id = 7;
    user.login = 'user7@user.com';
    user.password = 'qwe123';

    const access_token = jwtService.sign({ sub: user.id });

    const role = new Role();
    role.id = 1;
    role.name = 'role-name';

    const permission = Permission.fromPlain({
      action: Action.Update,
      subject: 'Role',
    });

    const newRoleName = 'role-new-name';

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(permissionsService, 'findOne').mockResolvedValue(permission);
    jest.spyOn(permission, 'save').mockResolvedValue(permission);

    return request(app.getHttpServer())
      .patch(`/permissions/${permission.id}`)
      .send({ name: newRoleName })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  it(`/PATCH /permissions/:id by user with global update permission`, () => {
    const permission = Permission.fromPlain({
      action: Action.Update,
      subject: 'Permission',
    });

    const role = new Role();
    role.permissions = [permission];

    const user = new User();
    user.id = 8;
    user.login = 'user8@user.com';
    user.password = 'qwe123';
    user.roles = Promise.resolve([role]);

    const permission2 = new Permission();
    permission2.id = 8;
    permission2.name = 'permission2-name';
    permission2.action = Action.Delete;
    permission2.subject = 'permission2-subject';

    const access_token = jwtService.sign({ sub: user.id });

    const newName = 'permission2-new-name';

    jest.spyOn(User, 'findOneBy').mockResolvedValueOnce(user);
    jest
      .spyOn(permissionsService, 'findOne')
      .mockResolvedValueOnce(permission2);
    jest.spyOn(permission2, 'save').mockResolvedValue(permission2);

    return request(app.getHttpServer())
      .patch(`/permissions/${permission2.id}`)
      .send({ name: newName })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          permission: expect.objectContaining({
            id: permission2.id,
            name: newName,
          }),
        });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
