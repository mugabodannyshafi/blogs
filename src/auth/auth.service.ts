import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { User } from 'src/database/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { nanoid } from 'nanoid';
import { MailService } from 'src/mail/mail.service';
import { Op } from 'sequelize';

@Injectable()
export class AuthService {
  constructor(
    private mailService: MailService,
    @InjectModel(User) private readonly UserModel: typeof User,
  ) {}

  async registerUser(signUpData: UserDto, imageUrl: string) {
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
      if (password !== password_confirmation) throw new BadRequestException({
        timestamp: new Date(),
        message: 'Passwords do not match',
      })

    const hashedPwd = await bcrypt.hash(password, 10);
    const hashedConfirmPassword = await bcrypt.hash(password_confirmation, 10);
    const user = await this.UserModel.create({
      email,
      username,
      password: hashedPwd,
      password_confirmation: hashedConfirmPassword,
      profile: imageUrl,
    });
    return user;
  }

  async validateUser(email: string, password: string): Promise<any> {

    const user = await this.UserModel.findOne({
      where: {
        email,
      },
    });
    if (user === null) throw new UnauthorizedException('Invalid credentials');
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    return user
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
      await this.mailService.sendPasswordResetEmail(email, resetToken);
    }
    return { message: 'If the user exists, they will receive an email' };
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