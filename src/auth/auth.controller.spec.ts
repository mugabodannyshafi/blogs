import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserDto } from './dto/user.dto';
import { AuthPayloadDto } from './dto/auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { Request } from 'express';
import {
  UnauthorizedException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { LocalGuard } from './guards/local.guard';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let cloudinaryService: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            registerUser: jest.fn(),
            validateUser: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService registerUser', async () => {
      const signUpData: UserDto = {
        email: 'danny@gmail.com',
        username: 'MUGABO Shafi Danny',
        password: 'plainPassword',
        password_confirmation: 'plainPassword',
        profile: 'profile image',
      };
      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from(''),
      } as Express.Multer.File;
      await authController.register(signUpData, mockFile);
      expect(authService.registerUser).toHaveBeenCalledWith(
        signUpData,
        mockFile,
      );
    });
  });
  describe('login', () => {
    it('should return user on successful login', async () => {
      const authPayloadDto: AuthPayloadDto = {
        email: 'test@test.com',
        password: 'password',
      };
      const user = { id: 1, email: 'test@test.com' };
      authService.validateUser = jest.fn().mockReturnValue(user);

      const result = await authController.login(authPayloadDto);
      expect(result).toEqual(user);
    });

    it('should throw an error if credentials are invalid', async () => {
      const authPayloadDto: AuthPayloadDto = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };

      authService.validateUser = jest.fn().mockReturnValue(null);

      try {
        await authController.login(authPayloadDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Invalid credentials');
        expect(error.getStatus()).toBe(401);
      }
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email', async () => {
      const forgotPasswordDto: ForgotPasswordDto = { email: 'test@test.com' };
      const result = { message: 'Password reset link sent' };

      jest.spyOn(authService, 'forgotPassword').mockResolvedValue(result);

      const response = await authController.forgotPassword(forgotPasswordDto);

      expect(response).toEqual(result);
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        newPassword: 'newPassword123',
        resetToken: 'resetToken123',
      };
      const result = { message: 'Password changed successfully' };

      jest.spyOn(authService, 'resetPassword').mockResolvedValue(result);

      const response = await authController.resetPassword(resetPasswordDto);

      expect(response).toEqual(result);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.newPassword,
        resetPasswordDto.resetToken,
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const request = {
        headers: {
          authorization: 'Bearer some-token',
        },
      } as unknown as Request;

      const result = { message: 'Logged out successfully' };

      jest.spyOn(authService, 'logout').mockResolvedValue(result);

      const response = await authController.logout(request);

      expect(response).toEqual(result);
      expect(authService.logout).toHaveBeenCalledWith('some-token');
    });
  });
});
