import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserDto } from './dto/user.dto';
import { AuthPayloadDto } from './dto/auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { LocalGuard } from './guards/local.guard';
import { Request } from 'express';
import { Readable } from 'stream';

const mockStream = new Readable({
  read() {
    this.push(null); // No data to push, end the stream
  }
});
describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let cloudinaryService: CloudinaryService;

  const mockAuthService = {
    registerUser: jest.fn(),
    validateUser: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    logout: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
  };

  const mockUser = {
    userId: 'user123',
    email: 'test@example.com',
    password: 'password123',
  };

  const mockSession = {
    userId: 'user123',
    authenticated: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userDto: UserDto = {
        email: 'test@example.com',
        username: 'Test User',
        password: 'password123',
        password_confirmation: 'password123',
      };
      const mockImage: Express.Multer.File = {
        fieldname: 'profile',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('imageBuffer'),
        stream: mockStream,
        destination: '',
        filename: '',
        path: '',
      };
      
      const uploadedImage = { secure_url: 'http://cloudinary.com/image.jpg' };
      mockCloudinaryService.uploadImage.mockResolvedValue(uploadedImage);
      mockAuthService.registerUser.mockResolvedValue(mockUser);

      const result = await authController.register(userDto, mockImage);

      expect(result).toEqual(mockUser);
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(mockImage);
      expect(authService.registerUser).toHaveBeenCalledWith(userDto, uploadedImage.secure_url);
    });

  });

  describe('login', () => {
    it('should login a user and set session', async () => {
      const authPayloadDto: AuthPayloadDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockRequest = { session: {}, headers: {} } as Request;
      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await authController.login(mockRequest, authPayloadDto);

      expect(result).toEqual({
        message: 'Login successful',
        userId: mockUser.userId,
      });
      expect(mockRequest.session.userId).toEqual(mockUser.userId);
      expect(authService.validateUser).toHaveBeenCalledWith(
        authPayloadDto.email,
        authPayloadDto.password,
      );
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);
      const authPayloadDto: AuthPayloadDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };
      const mockRequest = { session: {} } as Request;

      await expect(authController.login(mockRequest, authPayloadDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getAuthSession', () => {
    it('should return the session object', async () => {
      const session = { authenticated: true };

      const result = await authController.getAuthSession(session);

      expect(result).toEqual(session);
    });
  });

  describe('forgotPassword', () => {
    it('should call forgotPassword and send reset link', async () => {
      const forgotPasswordDto: ForgotPasswordDto = { email: 'test@example.com' };
      mockAuthService.forgotPassword.mockResolvedValue('Reset link sent');

      const result = await authController.forgotPassword(forgotPasswordDto);

      expect(result).toBe('Reset link sent');
      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto.email);
    });
  });

  describe('resetPassword', () => {
    it('should call resetPassword with new password and reset token', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        newPassword: 'newpassword123',
        resetToken: 'resetToken123',
      };
      mockAuthService.resetPassword.mockResolvedValue('Password changed');

      const result = await authController.resetPassword(resetPasswordDto);

      expect(result).toBe('Password changed');
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.newPassword,
        resetPasswordDto.resetToken,
      );
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const mockRequest = { headers: { authorization: 'Bearer token123' } } as Request;
      mockAuthService.logout.mockResolvedValue({ message: 'Logged out' });

      const result = await authController.logout(mockRequest);

      expect(result).toEqual({ message: 'Logged out' });
      expect(authService.logout).toHaveBeenCalledWith('token123');
    });
  });
});
