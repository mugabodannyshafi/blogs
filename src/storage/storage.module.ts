import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { Dropbox } from 'dropbox';
import { FileUploadService } from 'src/upload/fileUpload.service';

@Module({
  controllers: [StorageController],
  providers: [
    StorageService,
    FileUploadService,
    DropboxService,
    {
      provide: Dropbox,
      useFactory: () => {
        return new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
      },
    },
  ],
})
export class StorageModule {}
