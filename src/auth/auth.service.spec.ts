import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from 'src/database/models/user.model';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { UserDto } from './dto/user.dto';
import { MailService } from 'src/mail/mail.service';

import { nanoid } from 'nanoid';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'resetToken'),
}));

const testUser = {
  userId: 'id',
  email: 'danny@gmail.com',
  username: 'MUGABO Shafi Danny',
  password: 'hashedPassword',
  password_confirmation: 'hashedPassword',
  profile: 'profile',
  otp: 'resetToken',
  otpExpiresAt: new Date(Date.now() + 1000 * 60 * 5),
};
const imageUrl = 'imageUrl';

describe('AuthService', () => {
  let service: AuthService;
  let model: typeof User;
  let jwtService: JwtService;
  let mailService: MailService;

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
            update: jest.fn(),
            destroy: jest.fn(),
            findByPk: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    model = module.get<typeof User>(getModelToken(User));
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation((password, hashed) =>
        Promise.resolve(password === 'plainPassword'),
      );
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
        password_confirmation: 'plainPassword',
        profile: imageUrl,
      };

      const result = await service.registerUser(userDto, imageUrl);
      expect(result).toEqual(testUser);
    });

    it('should throw BadRequestException if password is not equal to password_confirmation', async () => {
      const userDto: UserDto = {
        email: 'danny@gmail.com',
        username: 'MUGABO Shafi Danny',
        password: 'plainPassword',
        password_confirmation: 'differentPassword',
        profile: imageUrl,
      };

      await expect(service.registerUser(userDto, imageUrl)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.registerUser(userDto, imageUrl)).rejects.toThrow(
        'Passwords do not match',
      );
    });

    it('should throw BadRequestException if email is already in use', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(testUser as any);

      const userDto: UserDto = {
        email: 'danny@gmail.com',
        username: 'MUGABO Shafi Danny',
        password: 'plainPassword',
        password_confirmation: 'plainPassword',
        profile: 'profile image',
      };

      await expect(service.registerUser(userDto, imageUrl)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user and return a user', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(testUser as any);

      const result = await service.validateUser(
        'danny@gmail.com',
        'plainPassword',
      );

      expect(result).toHaveProperty('email', 'danny@gmail.com');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null);

      await expect(
        service.validateUser('danny@gmail.com', 'plainPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(testUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.validateUser('danny@gmail.com', 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token and send an email', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(testUser as any);
      jest.spyOn(model, 'update').mockResolvedValue([1]); // Simulating update success

      const sendPasswordResetEmailMock = jest
        .spyOn(mailService, 'sendPasswordResetEmail')
        .mockResolvedValue();

      const result = await service.forgotPassword('danny@gmail.com');
      expect(result).toEqual({
        message: 'If the user exists, they will receive an email',
      });
      expect(nanoid).toHaveBeenCalledTimes(1);
      expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(
        'danny@gmail.com',
        'resetToken',
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null);

      await expect(
        service.forgotPassword('nonexistent@gmail.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if token is invalid or expired', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null); // No token found

      await expect(
        service.resetPassword('newPassword', 'invalidToken'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should successfully log out', async () => {
      const result = await service.logout('token');
      expect(result).toEqual({ message: 'Logout successful' });
    });
  });
});
