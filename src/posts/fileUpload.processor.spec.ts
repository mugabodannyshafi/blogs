import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadProcessor } from './fileUpload.proccessor';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { getModelToken } from '@nestjs/sequelize';
import { Job } from 'bull';
import { Post } from 'src/database/models/post.model';
import { User } from 'src/database/models/user.model';

describe('FileUploadProcessor', () => {
  let processor: FileUploadProcessor;
  let cloudinaryService: CloudinaryService;
  let postModel: typeof Post;
  let userModel: typeof User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadProcessor,
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
        {
          provide: getModelToken(Post),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<FileUploadProcessor>(FileUploadProcessor);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    postModel = module.get<typeof Post>(getModelToken(Post));
    userModel = module.get<typeof User>(getModelToken(User));
  });

  describe('handleImageUpload', () => {
    it('should upload an image and update post', async () => {
      const mockJob = { data: { image: 'test-image', postId: 1 } } as Job;
      const mockUploadedImage = { secure_url: 'http://image.url/test' };
      const mockPost = { postId: 1, save: jest.fn().mockResolvedValue(true), image: null };

      (cloudinaryService.uploadImage as jest.Mock).mockResolvedValue(mockUploadedImage);

      (postModel.findOne as jest.Mock).mockResolvedValue(mockPost);

      await processor.handleImageUpload(mockJob);

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith('test-image');
      expect(postModel.findOne).toHaveBeenCalledWith({ where: { postId: 1 } });
      expect(mockPost.image).toBe('http://image.url/test');
      expect(mockPost.save).toHaveBeenCalled();
    });


    it('should log a message if post is not found', async () => {
      const mockJob = { data: { image: 'test-image', postId: 1 } } as Job;
      const mockUploadedImage = { secure_url: 'http://image.url/test' };

      (cloudinaryService.uploadImage as jest.Mock).mockResolvedValue(mockUploadedImage);
      (postModel.findOne as jest.Mock).mockResolvedValue(null);

      await processor.handleImageUpload(mockJob);

      expect(postModel.findOne).toHaveBeenCalledWith({ where: { postId: 1 } });
    });
  });

  describe('handleProfileUpload', () => {
    it('should upload a profile image and update user', async () => {
      const mockJob = { data: { profile: 'test-profile', userId: 1 } } as Job;
      const mockUploadedImage = { secure_url: 'http://image.url/profile' };
      const mockUser = { userId: 1, save: jest.fn().mockResolvedValue(true), profile: null };

      (cloudinaryService.uploadImage as jest.Mock).mockResolvedValue(mockUploadedImage);
      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);

      await processor.handleProfileUpload(mockJob);

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith('test-profile');
      expect(userModel.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(mockUser.profile).toBe('http://image.url/profile');
      expect(mockUser.save).toHaveBeenCalled();
    });


    it('should log a message if user is not found', async () => {
      const mockJob = { data: { profile: 'test-profile', userId: 1 } } as Job;
      const mockUploadedImage = { secure_url: 'http://image.url/profile' };

      (cloudinaryService.uploadImage as jest.Mock).mockResolvedValue(mockUploadedImage);
      (userModel.findOne as jest.Mock).mockResolvedValue(null);

      await processor.handleProfileUpload(mockJob);

      expect(userModel.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
    });
  });
});
