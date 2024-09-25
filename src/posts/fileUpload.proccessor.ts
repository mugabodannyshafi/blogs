import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Post } from 'src/database/models/post.model';
import { User } from 'src/database/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { Logger } from '@nestjs/common';
@Processor('fileUpload')
export class FileUploadProcessor {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Post) private readonly postModel: typeof Post,
    @InjectModel(User) private readonly userModel: typeof User,
    ) {}
    private readonly logger = new Logger(FileUploadProcessor.name);

  @Process('upload-image')
  async handleImageUpload(job: Job) {
    const { image, postId } = job.data;

    try {
        let imageUrl = null
        const uploadedImage = await this.cloudinaryService.uploadImage(image);
        if (!uploadedImage) {
            this.logger.log(`Failed to upload image`);
        }
        imageUrl = uploadedImage.secure_url;
        const post = await this.postModel.findOne({
            where: {
                postId
            }
        })
        if (post) {
            post.image = imageUrl
           const result = await post.save()
           if (result) this.logger.log(`Image uploaded to cloudinary`);
        }
    } catch (error) {
      this.logger.log(`Image upload failed`);
    }
  }
  @Process('uploadUserImage')
  async handleProfileUpload(job: Job) {
    const { profile, userId } = job.data;

    try {
        let imageUrl = null
        const uploadedImage = await this.cloudinaryService.uploadImage(profile);
        if (!uploadedImage) {
            this.logger.log(`Failed to upload image`);
        }
        imageUrl = uploadedImage.secure_url;
        const user = await this.userModel.findOne({
            where: {
                userId
            }
        })
        if (user !== null) {
            user.profile = imageUrl
           const result = await user.save()
           if (result) this.logger.log(`Picture uploaded to cloudinary`);
        }
    } catch (error) {
      this.logger.log(`image upload failed`, error);
    }
  }
}
