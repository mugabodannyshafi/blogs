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

@Module({
  imports: [SequelizeModule.forRoot({
    dialect: 'mysql',
    host: 'localhost',
    port: 5432,
    username: 'root',
    password: 'dANNY1234@',
    database: 'blogs',
    models: [Post, Comment, User],
    
  }), DatabaseModule,PostsModule, UsersModule, CommentsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
