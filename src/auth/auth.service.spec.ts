import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MailService } from 'src/mail/mail.service';
import { getModelToken } from '@nestjs/sequelize';
import { BadRequestException } from '@nestjs/common';
import { Queue } from 'bull';
import * as bcrypt from 'bcrypt';
import { User } from 'src/database/models/user.model';
import { UnauthorizedException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let userModel: any;
  let mailQueue: Queue;
  let fileUploadQueue: Queue;
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
          provide: 'BullQueue_mailQueue',
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: 'BullQueue_fileUpload',
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: { sendPasswordResetEmail: jest.fn() },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userModel = module.get(getModelToken(User));
    mailQueue = module.get<Queue>('BullQueue_mailQueue');
    fileUploadQueue = module.get<Queue>('BullQueue_fileUpload');
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('registerUser', () => {
    const userDto = {
      email: 'test@example.com',
      username: 'testUser',
      password: 'password123',
      password_confirmation: 'password123',
      profile: 'profile.jpg',
    };

    it('should throw an error if the user already exists', async () => {
      userModel.findOne.mockResolvedValue({});

      await expect(authService.registerUser(userDto, null)).rejects.toThrow(
        BadRequestException,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { email: userDto.email },
      });
    });

    it('should throw an error if passwords do not match', async () => {
      userModel.findOne.mockResolvedValue(null);

      const mismatchedPasswordsDto = {
        ...userDto,
        password_confirmation: 'differentPassword',
      };

      await expect(
        authService.registerUser(mismatchedPasswordsDto, null),
      ).rejects.toThrow(BadRequestException);
    });

    it('should register a user and send an email, no image provided', async () => {
      userModel.findOne.mockResolvedValue(null);
      userModel.create.mockResolvedValue({ userId: '12345' });
      const hashedPwd = 'hashedPassword';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPwd);

      const result = await authService.registerUser(userDto, null);

      expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 10);
      expect(userModel.create).toHaveBeenCalledWith({
        email: userDto.email,
        username: userDto.username,
        password: hashedPwd,
        password_confirmation: hashedPwd,
      });
      expect(mailQueue.add).toHaveBeenCalledWith(
        'sendMail',
        { to: userDto.email, username: userDto.username },
        { delay: 3000, lifo: true },
      );
      expect(fileUploadQueue.add).not.toHaveBeenCalled();
      expect(result).toEqual({ userId: '12345' });
    });

    it('should register a user, send an email, and upload image', async () => {
      userModel.findOne.mockResolvedValue(null);
      userModel.create.mockResolvedValue({ userId: '12345' });
      const hashedPwd = 'hashedPassword';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPwd);

      const result = await authService.registerUser(userDto, userDto.profile);

      expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 10);
      expect(userModel.create).toHaveBeenCalledWith({
        email: userDto.email,
        username: userDto.username,
        password: hashedPwd,
        password_confirmation: hashedPwd,
      });
      expect(mailQueue.add).toHaveBeenCalledWith(
        'sendMail',
        { to: userDto.email, username: userDto.username },
        { delay: 3000, lifo: true },
      );
      expect(fileUploadQueue.add).toHaveBeenCalledWith(
        'uploadUserImage',
        { profile: userDto.profile, userId: '12345' },
        { delay: 3000, lifo: true },
      );
      expect(result).toEqual({ userId: '12345' });
    });
  });

  describe('validateUser', () => {
    it('should validate user and return a token', async () => {
      const userDto = {
        email: 'test@example.com',
        username: 'testUser',
        password: 'password123',
        password_confirmation: 'password123',
        profile: 'profile.jpg',
      };
      jest.spyOn(userModel, 'findOne').mockResolvedValue(userDto as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser(
        'danny@gmail.com',
        'plainPassword',
      );
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.token).toEqual('token');
    });

    it('should throw an error if credentials are invalid', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(
        authService.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if token is invalid or expired', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(
        authService.resetPassword('newPassword', 'invalidToken'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should return a success message on logout', async () => {
      const result = await authService.logout('someToken');

      expect(result).toEqual({ message: 'Logout successful' });
    });
  });
});
