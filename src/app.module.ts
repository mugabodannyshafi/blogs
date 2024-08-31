import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from './auth/auth.module';
import { Comment } from './comments/entities/comment.entity';
import { Post } from './posts/entities/post.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users/entities/user.entity';
@Module({
  imports: [SequelizeModule.forRoot({
    dialect: 'mysql', // or 'postgres', 'sqlite', etc.
    host: 'localhost',
    port: 5432,
    username: 'root',
    password: 'dANNY1234@',
    database: 'blogs',
    models: [Post, Comment, User], // Add your models here
  }),DatabaseModule, PostsModule, UsersModule, CommentsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
