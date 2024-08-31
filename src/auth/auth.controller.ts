import {
    Body,
    Controller,
    Get,
    HttpException,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { InternalServerErrorException } from '@nestjs/common';
  import { Request } from 'express';
  import { AuthPayloadDto } from './dto/auth.dto';
  import { AuthService } from './auth.service';
  import { AuthGuard } from '@nestjs/passport';
  import { LocalGuard } from './guards/local.guard';
  import { JwtAuthGuard } from './guards/jwt.guard';
  import { UserDto } from './dto/user.dto';
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('register')
    async register(@Body() signUpData: UserDto) {
      return this.authService.registerUser(signUpData);
    }
  
    @Post('login')
    @UseGuards(LocalGuard)
    login(@Body() authPayloadDto: AuthPayloadDto) {
      const user = this.authService.validateUser(
        authPayloadDto.email,
        authPayloadDto.password,
      );
      if (!user) throw new HttpException('Invalid credentials', 401);
      return user;
    }
  }
  