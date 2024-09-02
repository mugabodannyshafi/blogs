import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';
import { nanoid } from 'nanoid';
import { MailService } from 'src/mail/mail.service';
import { Op } from 'sequelize';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    @InjectModel(User) private readonly UserModel: typeof User,
  ) {}

  async registerUser(signUpData: UserDto) {
    const { email, username, password } = signUpData;
    const emailInUse = await this.UserModel.findOne({
      where: {
        email,
      },
    });
    if (emailInUse) throw new BadRequestException('User already exists');

    const hashedPwd = await bcrypt.hash(password, 10);
    const user = await this.UserModel.create({
      email,
      username,
      password: hashedPwd,
    });
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

  async changePassword(userId, oldPassword: string, newPassword: string) {
    const userTest = await this.UserModel.findOne({ where: { userId } });
    const user = userTest.dataValues;

    if (!user) throw new NotFoundException('User Not Found');

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) throw new BadRequestException('Invalid old password');

    const hashedPwd = await bcrypt.hash(newPassword, 10);
    await this.UserModel.update({ password: hashedPwd }, { where: { userId } });

    return { message: 'password changed successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.UserModel.findOne({ where: { email: email } });
    if (!user) throw new NotFoundException('User Not Found');
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
      token.otp = null
      token.otpExpiresAt = null
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
