import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { User } from 'src/database/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { nanoid } from 'nanoid';
import { MailService } from 'src/mail/mail.service';
import { Op } from 'sequelize';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    @InjectModel(User) private readonly UserModel: typeof User,
    @InjectQueue('mailQueue') private readonly mailQueue: Queue,
    @InjectQueue('fileUpload') private readonly fileUploadQueue: Queue,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async registerUser(signUpData: UserDto, image: any) {
    const { email, username, password, password_confirmation, profile } =
      signUpData;
    const emailInUse = await this.UserModel.findOne({
      where: {
        email,
      },
    });
    if (emailInUse)
      throw new BadRequestException({
        timestamp: new Date(),
        message: 'User already exists',
      });
    if (password !== password_confirmation)
      throw new BadRequestException({
        timestamp: new Date(),
        message: 'Passwords do not match',
      });

    const hashedPwd = await bcrypt.hash(password, 10);
    const hashedConfirmPassword = await bcrypt.hash(password_confirmation, 10);
    const user = await this.UserModel.create({
      email,
      username,
      password: hashedPwd,
      password_confirmation: hashedConfirmPassword,
    });
    if (user !== null) {
      await this.mailQueue.add(
        'sendMail',
        {
          to: email,
          username: username,
        },
        { delay: 3000, lifo: true },
      );
    }

    if (image) {
      await this.fileUploadQueue.add(
        'uploadUserImage',
        {
          profile: image,
          userId: user.userId,
        },
        { delay: 3000, lifo: true },
      );
    }
    return user;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.UserModel.findOne({
      where: {
        email,
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { userId: user.userId };
    return {
      user: user,
      token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.UserModel.findOne({ where: { email: email } });
    if (user === null) throw new NotFoundException('User Not Found');
    if (user) {
      const resetToken = nanoid(64);
      const otpExpiresAt = new Date();
      otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 5);
      await this.UserModel.update(
        { otp: resetToken, otpExpiresAt: otpExpiresAt },
        { where: { email } },
      );
      await this.mailQueue.add(
        'sendResetMail',
        {
          to: email,
          token: resetToken,
        },
        { delay: 3000, lifo: true },
      );
    }
    return { message: 'check your email address' };
  }

  async resetPassword(newPassword: string, resetToken: string) {
    const token = await this.UserModel.findOne({
      where: {
        otp: resetToken,
        otpExpiresAt: {
          [Op.gte]: new Date(),
        },
      },
    });

    if (token) {
      token.otp = null;
      token.otpExpiresAt = null;
      await token.save();

      const user = await this.UserModel.findByPk(token.userId);

      if (user) {
        const hashedPwd = await bcrypt.hash(newPassword, 10);
        user.password = hashedPwd;
        await user.save();
      }

      return { message: 'password changed successfully' };
    } else {
      throw new BadRequestException('Token not found or expired');
    }
  }

  async logout(token: string) {
    return { message: 'Logout successful' };
  }
}
