import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller'; 
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';
import { AuthPayloadDto } from './dto/auth.dto'; 
import { ChangePasswordDto } from './dto/ChangePassword.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { HttpException, InternalServerErrorException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockAuthService = {
      registerUser: jest.fn(),
      validateUser: jest.fn(),
      changePassword: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      logout: jest.fn(),
    };

    const mockJwtService = {
      decode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
      imports: [
        JwtModule.register({ secret: 'test-secret' }),
      ],
    })
      .overrideGuard(LocalGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService registerUser', async () => {
      const signUpData: UserDto = {
        email: 'danny@gmail.com',
        username: 'MUGABO Shafi Danny',
        password: 'plainPassword',
        password_confirmation: 'plainPassword',
        profile: 'profile image'
      }
      await controller.register(signUpData);
      expect(service.registerUser).toHaveBeenCalledWith(signUpData);
    });
  });

  describe('login', () => {
    it('should return user on successful login', async () => {
      const authPayloadDto: AuthPayloadDto = {
        email: 'test@test.com',
        password: 'password',
      };
      const user = { id: 1, email: 'test@test.com' }; // Mock user data
      service.validateUser = jest.fn().mockReturnValue(user);

      const result = await controller.login(authPayloadDto);
      expect(result).toEqual(user);
    });

    it('should throw an error if credentials are invalid', async () => {
      const authPayloadDto: AuthPayloadDto = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };

      service.validateUser = jest.fn().mockReturnValue(null);

      try {
        await controller.login(authPayloadDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Invalid credentials');
        expect(error.getStatus()).toBe(401);
      }
    });
  });



  describe('forgotPassword', () => {
    it('should send a password reset email', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@test.com',
      };

      await controller.forgotPassword(forgotPasswordDto);

      expect(service.forgotPassword).toHaveBeenCalledWith('test@test.com');
    });
  });

  describe('resetPassword', () => {
    it('should reset the user password', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        newPassword: 'newPass456',
        resetToken: 'validResetToken',
      };

      await controller.resetPassword(resetPasswordDto);

      expect(service.resetPassword).toHaveBeenCalledWith('newPass456', 'validResetToken');
    });
  });

  describe('logout', () => {
    it('should logout the user', async () => {
      const request = {
        headers: {
          authorization: 'Bearer someValidToken',
        },
      } as any;

      await controller.logout(request);

      expect(service.logout).toHaveBeenCalledWith('someValidToken');
    });
  });
});
