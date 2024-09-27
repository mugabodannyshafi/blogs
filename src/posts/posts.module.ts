import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/database/models/post.model';
import { User } from 'src/database/models/user.model';
import { SessionEntity } from 'src/database/models/Sesssion';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { BullModule } from '@nestjs/bull';
import { FileUploadProcessor } from './fileUpload.proccessor';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { Dropbox } from 'dropbox';

@Module({
  imports: [
    SequelizeModule.forFeature([Post, User, SessionEntity]),
    BullModule.registerQueue({
      name: 'fileUpload',
    }),
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    JwtService,
    CloudinaryService,
    FileUploadProcessor,
    DropboxService,
    {
      provide: Dropbox,
      useFactory: () => {
        return new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
      },
    },
  ],
})
export class PostsModule {}
