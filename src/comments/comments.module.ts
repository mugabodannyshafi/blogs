import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from 'src/database/models/comment.model';
import { Post } from 'src/database/models/post.model';

@Module({
  imports: [SequelizeModule.forFeature([Comment, Post]),],
  controllers: [CommentsController],
  providers: [CommentsService, JwtService],
  exports: [CommentsService]
})
export class CommentsModule {}
