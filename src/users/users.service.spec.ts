import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from 'src/database/models/user.model';
import { getModelToken } from '@nestjs/sequelize';

const testUser = {
  email: 'danny@gmail.com',
  password: "asdfghjkl;'",
  username: 'MUGABO Shafi Danny',
};

describe('UsersService', () => {
  let service: UsersService;
  let model: typeof User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: {
            findAll: jest.fn().mockResolvedValue([testUser]),
            findOne: jest.fn().mockImplementation(({ where: { userId } }) => {
              if (userId === 'id') return Promise.resolve(testUser);
              return Promise.reject(new Error('User not found'));
            }),
            create: jest.fn().mockResolvedValue(testUser),
            remove: jest.fn().mockResolvedValue(null),
            update: jest.fn().mockImplementation((userId, updateUserDto) => {
              if (userId === 'id') {
                return Promise.resolve({ ...testUser, ...updateUserDto });
              }
              return Promise.reject(new Error('User not found'));
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<typeof User>(getModelToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get all users', async () => {
    expect(await service.findAll()).toEqual([testUser]);
  });

  it('should get a single user', async () => {
    const findOneSpy = jest.spyOn(model, 'findOne');
    const result = await service.findOne('id');
    expect(result).toEqual(testUser);
    expect(findOneSpy).toBeCalledWith({ where: { userId: 'id' } });
  });
});
