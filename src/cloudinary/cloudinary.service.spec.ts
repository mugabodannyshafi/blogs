import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should configure cloudinary', () => {
    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      const mockResult = {
        url: 'http://example.com/test-image.jpg',
      };

      const mockUploadStream = (cb) => {
        cb(null, mockResult);
        return {
          end: jest.fn(),
        };
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(mockUploadStream);

      const result = await service.uploadImage(mockFile);
      expect(result).toEqual(mockResult);
    });

    it('should throw error if upload fails', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      const mockError = new Error('Upload failed');

      const mockUploadStream = (cb) => {
        cb(mockError, null);
        return {
          end: jest.fn(),
        };
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(mockUploadStream);

      await expect(service.uploadImage(mockFile)).rejects.toThrow('Upload failed');
    });
  });
});
