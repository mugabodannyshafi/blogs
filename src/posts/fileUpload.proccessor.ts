import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Post } from 'src/database/models/post.model';
import { User } from 'src/database/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { Inject, Logger } from '@nestjs/common';
import { DropboxService } from 'src/dropbox/dropbox.service';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
@Processor('fileUpload')
export class FileUploadProcessor {
  private readonly logger = new Logger(FileUploadProcessor.name);
  private readonly uploadsDir = path.join(__dirname, '../uploads');
  constructor(
    @Inject() private readonly dropboxService: DropboxService,
    @InjectModel(Post) private readonly postModel: typeof Post,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  @Process('upload-image')
  async handleImageUpload(job: Job) {
    const { image, postId } = job.data;

    try {

      if (!image || !image.originalname) {
        throw new Error('Image data is undefined or invalid');
      }

      const sanitizedFileName = image.originalname.replace(
        /[^a-zA-Z0-9.\-_]/g,
        '',
      );
      const destinationPath = `/${Date.now()}_${sanitizedFileName}`;
      const filePath = path.join(this.uploadsDir, sanitizedFileName);

      this.logger.log(
        `Received file upload: ${image.originalname}, size: ${image.size}`,
      );
      const bufferData = Buffer.from(image.buffer.data);

      fs.writeFileSync(filePath, bufferData);

      this.logger.log(`File saved locally at: ${filePath}`);

      const uploadedImageUrl = await this.dropboxService.uploadImage(
        filePath,
        destinationPath,
      );

      fs.unlinkSync(filePath);
      this.logger.log(`Local file deleted: ${filePath}`);

      const post: any = await this.postModel.findOne({
        where: {
          postId,
        },
      });

      if (post) {
        post.image = uploadedImageUrl;
        const result = await post.save();
        if (result)
          this.logger.log(`Image uploaded to Dropbox: ${uploadedImageUrl}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to upload image to Dropbox: ${error.message}`,
        error.stack,
      );
    }
  }

  @Process('uploadUserImage')
  async handleProfileUpload(job: Job) {
    const { profile, userId } = job.data;

    try {
      if (!profile || !profile.originalname) {
        throw new Error('profile data is undefined or invalid');
      }

      const sanitizedFileName = profile.originalname.replace(
        /[^a-zA-Z0-9.\-_]/g,
        '',
      );
      const destinationPath = `/${Date.now()}_${sanitizedFileName}`;
      const filePath = path.join(this.uploadsDir, sanitizedFileName);


      this.logger.log(
        `Received file upload: ${profile.originalname}, size: ${profile.size}`,
      );
      const bufferData = Buffer.from(profile.buffer.data);

      fs.writeFileSync(filePath, bufferData);

      this.logger.log(`File saved locally at: ${filePath}`);

      const uploadedImageUrl = await this.dropboxService.uploadImage(
        filePath,
        destinationPath,
      );

      fs.unlinkSync(filePath);
      this.logger.log(`Local file deleted: ${filePath}`);
      const user = await this.userModel.findOne({
        where: {
          userId,
        },
      });
      if (user !== null) {
        user.profile = uploadedImageUrl;

        const result = await user.save();
        if (result) this.logger.log(`Picture uploaded to dropbox`);
      }
    } catch (error) {
      this.logger.log(`image upload failed`, error);
    }
  }
}
