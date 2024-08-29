import { Sequelize } from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import * as dotenv from 'dotenv';
dotenv.config();


export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
        console.log('-->first: ', process.env.DATABASE_URL)
      const sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
      });
      sequelize.addModels([User, Post, Comment]);

      try {
        await sequelize.authenticate();
        console.log('Connected to database');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }

      await sequelize.sync(); 
      return sequelize;
    }
  }
];
