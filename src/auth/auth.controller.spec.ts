import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserDto } from './dto/user.dto';
import { AuthPayloadDto } from './dto/auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { Request } from 'express';
import { UnauthorizedException, HttpStatus, HttpException } from '@nestjs/common';
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

  // describe('register', () => {
  //   it('should register a user successfully', async () => {
  //     const userDto: UserDto = {
  //       email: 'test@test.com',
  //       username: 'testUser',
  //       password: 'password123',
  //       password_confirmation: 'password123',
  //     };
  //     const mockFile = { originalname: 'test.jpg', buffer: Buffer.from('') } as Express.Multer.File;
  //     const result = { message: 'User created successfully' };

  //     jest.spyOn(authService, 'registerUser').mockResolvedValue(result);

  //     const response = await authController.register(userDto, mockFile);

  //     expect(response).toEqual(result);
  //     expect(authService.registerUser).toHaveBeenCalledWith(userDto, mockFile);
  //   });

  //   it('should throw an error when registration fails', async () => {
  //     const userDto: UserDto = {
  //       email: 'test@test.com',
  //       username: 'testUser',
  //       password: 'password123',
  //       password_confirmation: 'password123',
  //     };
  //     const mockFile = { originalname: 'test.jpg', buffer: Buffer.from('') } as Express.Multer.File;

  //     jest.spyOn(authService, 'registerUser').mockRejectedValue(new Error());

  //     await expect(authController.register(userDto, mockFile)).rejects.toThrow(
  //       new HttpException('Error creating a user', HttpStatus.BAD_REQUEST),
  //     );
  //   });
  // });

  describe('login', () => {
    it('should login successfully', async () => {
      const request = {
        session: {},
      } as Request;

      const authPayload: AuthPayloadDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      const mockUser = {
        userId: 'userId123',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);

      const result = await authController.login(request, authPayload);

      expect(result).toEqual({
        message: 'Login successful',
        userId: mockUser.userId,
      });
      expect(authService.validateUser).toHaveBeenCalledWith(
        authPayload.email,
        authPayload.password,
      );
      expect(request.session.userId).toBe(mockUser.userId);
    });

    it('should throw an UnauthorizedException when login fails', async () => {
      const request = {
        session: {},
      } as Request;

      const authPayload: AuthPayloadDto = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(authController.login(request, authPayload)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email', async () => {
      const forgotPasswordDto: ForgotPasswordDto = { email: 'test@test.com' };
      const result = { message: 'Password reset link sent' };

      jest.spyOn(authService, 'forgotPassword').mockResolvedValue(result);

      const response = await authController.forgotPassword(forgotPasswordDto);

      expect(response).toEqual(result);
      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto.email);
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
