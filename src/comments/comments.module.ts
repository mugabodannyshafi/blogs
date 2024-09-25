import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from 'src/database/models/comment.model';
import { Post } from 'src/database/models/post.model';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/database/models/user.model';

@Module({
imports: [SequelizeModule.forFeature([Comment, Post, User]),],
  controllers: [CommentsController],
  providers: [CommentsService, JwtService, MailService],
  exports: [CommentsService]
})
export class CommentsModule {}
