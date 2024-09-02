import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from './entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';

@Module({
  imports: [SequelizeModule.forFeature([Comment, Post]),],
  controllers: [CommentsController],
  providers: [CommentsService, JwtService],
  exports: [CommentsService]
})
export class CommentsModule {}
