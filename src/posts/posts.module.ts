import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/database/models/post.model';

@Module({
  imports: [SequelizeModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsService, JwtService],
})
export class PostsModule {}
