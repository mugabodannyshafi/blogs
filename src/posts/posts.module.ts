import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/database/models/post.model';
import { User } from 'src/database/models/user.model';
import { SessionEntity } from 'src/database/models/Sesssion';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [SequelizeModule.forFeature([Post, User, SessionEntity])],
  controllers: [PostsController],
  providers: [PostsService, JwtService, CloudinaryService],
})
export class PostsModule {}
