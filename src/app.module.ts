import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from './auth/auth.module';
import { Post } from './database/models/post.model';
import { User } from './database/models/user.model';
import { Comment } from './database/models/comment.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { DatabaseModule } from './database/database.module';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { MailService } from './mail/mail.service';
import { Reply } from './database/models/reply.model';
import { RepliesModule } from './replies/replies.module';
import { ReportModule } from './report/report.module';
import { ReportService } from './report/report.service';
import { StorageModule } from './storage/storage.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST ,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      models: [Post, Comment, User, Reply],
    }),
    SequelizeModule.forFeature([User]),
    BullModule.forRoot({
      redis:{
        host: 'localhost',
        port: 6379,
      }
    }),
    JwtModule.register({
      secret: 'abc.456',
      signOptions: { expiresIn: '1h' },
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    PostsModule,
    UsersModule,
    CommentsModule,
    AuthModule,
    RepliesModule,
    ReportModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
