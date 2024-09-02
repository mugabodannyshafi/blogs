import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Put,
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
import { ChangePasswordDto } from './dto/ChangePassword.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOAuth2,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { ForgotResponse } from './dto/forgot-password-response.dto';
@ApiTags('User')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request, Try again!',
  })
  async register(@Body() signUpData: UserDto) {
    return this.authService.registerUser(signUpData);
  }

  @Post('login')
  @ApiCreatedResponse({
    description: 'User logged in successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request, Try again!',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @UseGuards(LocalGuard)
  login(@Body() authPayloadDto: AuthPayloadDto) {
    const user = this.authService.validateUser(
      authPayloadDto.email,
      authPayloadDto.password,
    );
    if (!user) throw new HttpException('Invalid credentials', 401);
    return user;
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Password changed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request, Try again!',
  })
  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.authService.changePassword(
      json.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @ApiCreatedResponse({
    description: 'Link will automatically sent to the email address',
    type: ForgotResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request, Try again!',
  })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @ApiCreatedResponse({
    description: 'password changed',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request, Try again!',
  })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.resetToken,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    return this.authService.logout(token);
  }
}
