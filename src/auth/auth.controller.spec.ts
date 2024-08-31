import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { LocalGuard } from 'src/auth/guards/local.guard';
import { UserDto } from 'src/auth/dto/user.dto';
import { AuthPayloadDto } from 'src/auth/dto/auth.dto';
import { HttpException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      registerUser: jest.fn(),
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(LocalGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService registerUser', async () => {
      const signUpData: UserDto = {
        email: 'danny@gmail.com',
        password: "asdfghjkl;'",
        username: 'MUGABO Shafi Danny',
      };
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

    it('should throw an error if credentials are invalid', () => {
      const authPayloadDto: AuthPayloadDto = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };
  
      service.validateUser = jest.fn().mockReturnValue(null);
  
      try {
        controller.login(authPayloadDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Invalid credentials');
        expect(error.getStatus()).toBe(401);
      }
    });
  });
});
