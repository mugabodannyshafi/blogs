import { Sequelize } from 'sequelize-typescript';
import { User } from './models/user.model';
import { Post } from './models/post.model';
import { Comment } from './models/comment.model';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        models: [User, Post, Comment],
        logging: false,
      });

      try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }

      return sequelize;
    },
  },
];
