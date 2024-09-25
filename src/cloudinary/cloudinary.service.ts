import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<any> {
    const buffer = Buffer.isBuffer(file.buffer) 
    ? file.buffer 
    : Buffer.from((file.buffer as any).data);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
      uploadStream.end(buffer)
    });
  }
}
