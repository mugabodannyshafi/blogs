import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UserDto } from './dto/user.dto';

const testUser = {
  userId: 'id',
  email: 'danny@gmail.com',
  password: 'hashedPassword',
  username: 'MUGABO Shafi Danny',
};

describe('AuthService', () => {
  let service: AuthService;
  let model: typeof User;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: 'SEQUELIZE',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    model = module.get<typeof User>(getModelToken(User));
    jwtService = module.get<JwtService>(JwtService);

    // Mock the bcrypt functions
    jest.spyOn(bcrypt, 'hash').mockImplementation((password) => Promise.resolve('hashedPassword'));
    jest.spyOn(bcrypt, 'compare').mockImplementation((password, hashed) => Promise.resolve(password === 'plainPassword'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null); // No user found
      jest.spyOn(model, 'create').mockResolvedValue(testUser as any); // Successful creation
    
      const userDto: UserDto = {
        email: 'danny@gmail.com',
        username: 'MUGABO Shafi Danny',
        password: 'plainPassword',
      };
    
      const result = await service.registerUser(userDto);
      expect(result).toEqual(testUser);
    });

    it('should throw BadRequestException if email is already in use', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(testUser as any);

      const userDto: UserDto = {
        email: 'danny@gmail.com',
        username: 'MUGABO Shafi Danny',
        password: 'plainPassword',
      };

      await expect(service.registerUser(userDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateUser', () => {
    it('should validate user and return a token', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(testUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.validateUser('danny@gmail.com', 'plainPassword');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.token).toEqual('token');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null);

      await expect(service.validateUser('danny@gmail.com', 'plainPassword')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(testUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.validateUser('danny@gmail.com', 'wrongPassword')).rejects.toThrow(UnauthorizedException);
    });
  });
});
