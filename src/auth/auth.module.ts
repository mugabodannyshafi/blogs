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
import { BullModule } from '@nestjs/bull';
// import { FileUploadProcessor } from './imageUpload.process';
import { MailProcessor } from 'src/mail/mail.process';
@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    PassportModule.register({
      session: true,
    }),
    BullModule.registerQueue({
      name: 'mailQueue',
    },
    {
      name: 'fileUpload'
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    MailService,
    LocalStrategy,
    SessionSerializer,
    CloudinaryService,
    MailProcessor
    // FileUploadProcessor
  ],
})
export class AuthModule {}
