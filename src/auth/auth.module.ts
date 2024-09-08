import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from 'src/database/models/user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { MailService } from 'src/mail/mail.service';
import { LocalStrategy } from './strategies/LocalStrategy';
import { SessionSerializer } from './utils/SessionSerializer';
import { UsersService } from 'src/users/users.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    PassportModule.register({
      session: true
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, MailService, LocalStrategy, SessionSerializer, CloudinaryService],
})
export class AuthModule {}