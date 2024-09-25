import { Module } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { RepliesController } from './replies.controller';
import { Comment } from 'src/database/models/comment.model';
import { Post } from 'src/database/models/post.model';
import { User } from 'src/database/models/user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { Reply } from 'src/database/models/reply.model';

@Module({
  imports: [SequelizeModule.forFeature([Comment, Post, User, Reply])],
  controllers: [RepliesController],
  providers: [RepliesService],
})
export class RepliesModule {}
