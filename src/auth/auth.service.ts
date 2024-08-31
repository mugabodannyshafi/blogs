import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User) private readonly UserModel: typeof User
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
}
