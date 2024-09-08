import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Req,
  Session,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';
import { AuthPayloadDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UserDto } from './dto/user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOAuth2,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from 'src/database/models/user.model';
import { ForgotResponse } from './dto/forgot-password-response.dto';
import { AuthenticatedGuard, LocalGuard } from './guards/local.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@ApiTags('User')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('register')
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request, Try again!',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'mugaboshafidanny@gmail.com' },
        username: { type: 'string', example: 'MUGABO Shafi Danny' },
        password: { type: 'string', example: 'password123' },
        password_confirmation: { type: 'string', example: 'password123' },
        profile: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('profile'))
  async register(
    @Body() signUpData: UserDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    try {
      let imageUrl = null;

      if (image) {
        const uploadedImage = await this.cloudinaryService.uploadImage(image);
        imageUrl = uploadedImage.secure_url;
      }
      return this.authService.registerUser(signUpData, imageUrl);
    } catch (error) {
      throw new HttpException('Error creating a user', HttpStatus.BAD_REQUEST);
    }
    // return this.authService.registerUser(signUpData);
  }

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() request: Request, @Body() authPayloadDto: AuthPayloadDto) {
    console.log('-->INSIDE LOGIN CONTROLLER');
    const user = await this.authService.validateUser(
      authPayloadDto.email,
      authPayloadDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    request.session.userId = user.userId;
    console.log('-->session', request.session);
    return {
      message: 'Login successful',
      userId: user.userId, // Return the userId as part of the response if you need
    };
  }

  @Get('session')
  async getAuthSession(@Session() session: Record<string, any>) {
    // console.log(session)
    // console.log(session.id)
    session.authenticated = true;
    return session;
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

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  async logout(@Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    return this.authService.logout(token);
  }
}
