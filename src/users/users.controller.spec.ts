import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from 'src/database/models/user.model';

const testUser = {
  email: 'danny@gmail.com',
  password: "asdfghjkl;'",
  username: 'MUGABO Shafi Danny',
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(() => [testUser]),
            create: jest.fn(() => testUser),
            findOne: jest.fn().mockImplementation((id: string) =>
              Promise.resolve({
                email: 'danny@gmail.com',
                password: "asdfghjkl;'",
                username: 'MUGABO Shafi Danny',
                id,
              }),
            ),
            remove: jest.fn(),
            update: jest
              .fn()
              .mockImplementation((userId: string, user: Partial<User>) =>
                Promise.resolve({
                  email: 'danny@gmail.com',
                  password: "asdfghjkl;'",
                  username: 'MUGABO Shafi Danny',
                  ...user,
                }),
              ),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<UsersController>(UsersController);
    service = moduleRef.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all users', async () => {
    expect(await controller.findAll()).toEqual([testUser]);
  });

  it('should get a single user', async () => {
    const userId = 'some-user-id';
    const expectedUser = {
      ...testUser,
      id: userId,
    };
    const result = await controller.findOne(userId);

    expect(result).toEqual(expectedUser);
    expect(service.findOne).toHaveBeenCalledWith(userId);
  });
});
