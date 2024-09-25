import { TestingModule, Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from 'src/database/models/user.model';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';


const mockFullUser = {
  userId: '157ff5f6-50a6-4abf-a07a-0b4923b1b97c',
  email: 'mugabodannyshafi250@gmail.com',
  username: 'MUGABO Shafi Danny',
  password:
    '$2b$10$WhyPhcoOOg1Xi7UwA.ZCvetmdqjhAFxSd51HcIwr96w2bZROU5ejO',
  password_confirmation:
    '$2b$10$BxKqhJx22fklOnejXEsAiuqp.EnBASCrCGJ4rLrtJ6rcD7XuAKzVK',
  profile:
    'https://res.cloudinary.com/dxizjtfpd/image/upload/v1725963275/lpklfpvcvqpjybyudc9l.png',
  otp: null,
  otpExpiresAt: null,
  createdAt: '2024-09-10T10:14:29.000Z',
  updatedAt: '2024-09-10T10:14:35.000Z',
}

const updatedMockUser = { ...mockFullUser, email: 'shafi@gmail.com' };
describe('UserService', () => {
  let service: UsersService;
  let userModel: typeof User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            destroy: jest.fn(),
            save: jest.fn(),
            update: jest.fn().mockResolvedValue(updatedMockUser)
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<typeof User>(getModelToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all user', async () => {
      const mockUser = [
        {
          userId: '157ff5f6-50a6-4abf-a07a-0b4923b1b97c',
          email: 'mugabodannyshafi250@gmail.com',
          username: 'MUGABO Shafi Danny',
          password:
            '$2b$10$WhyPhcoOOg1Xi7UwA.ZCvetmdqjhAFxSd51HcIwr96w2bZROU5ejO',
          password_confirmation:
            '$2b$10$BxKqhJx22fklOnejXEsAiuqp.EnBASCrCGJ4rLrtJ6rcD7XuAKzVK',
          profile:
            'https://res.cloudinary.com/dxizjtfpd/image/upload/v1725963275/lpklfpvcvqpjybyudc9l.png',
          otp: null,
          otpExpiresAt: null,
          createdAt: '2024-09-10T10:14:29.000Z',
          updatedAt: '2024-09-10T10:14:35.000Z',
        },
      ];
      userModel.findAll = jest.fn().mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(userModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const mockUser = {
        userId: '157ff5f6-50a6-4abf-a07a-0b4923b1b97c',
        email: 'mugabodannyshafi250@gmail.com',
        username: 'MUGABO Shafi Danny',
        password:
          '$2b$10$WhyPhcoOOg1Xi7UwA.ZCvetmdqjhAFxSd51HcIwr96w2bZROU5ejO',
        password_confirmation:
          '$2b$10$BxKqhJx22fklOnejXEsAiuqp.EnBASCrCGJ4rLrtJ6rcD7XuAKzVK',
        profile:
          'https://res.cloudinary.com/dxizjtfpd/image/upload/v1725963275/lpklfpvcvqpjybyudc9l.png',
        otp: null,
        otpExpiresAt: null,
        createdAt: '2024-09-10T10:14:29.000Z',
        updatedAt: '2024-09-10T10:14:35.000Z',
      };
      userModel.findOne = jest.fn().mockResolvedValue(mockUser);
      const result = await service.findOne(
        '157ff5f6-50a6-4abf-a07a-0b4923b1b97c',
      );
      expect(result).toEqual(mockUser);
      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { userId: '157ff5f6-50a6-4abf-a07a-0b4923b1b97c' },
      });
    });

    it('should throw an error if id is invalid', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const userId = 'uuid';
      const updateUserDto = { email: 'shafi@gmail.com', username: 'hey' };

      const mockUser = { ...mockFullUser, update: jest.fn().mockResolvedValue({ ...mockFullUser, email: 'shafi@gmail.com' }) };
      userModel.findOne = jest.fn().mockResolvedValue(mockUser);
  
      const result = await service.update(userId, updateUserDto);
  
      expect(result).toEqual({ ...mockFullUser, email: 'shafi@gmail.com' });
      expect(userModel.findOne).toHaveBeenCalledWith({ where: { userId: userId } });
      expect(mockUser.update).toHaveBeenCalledWith(updateUserDto);
    });
  });
  
  
});
