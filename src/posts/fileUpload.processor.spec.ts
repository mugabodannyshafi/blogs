import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadProcessor } from './fileUpload.proccessor';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { getModelToken } from '@nestjs/sequelize';
import { Post } from 'src/database/models/post.model';
import { User } from 'src/database/models/user.model';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';

jest.mock('fs');

describe('FileUploadProcessor', () => {
  let processor: FileUploadProcessor;
  let dropboxService: DropboxService;
  let postModel: typeof Post;
  let userModel: typeof User;
  let errorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadProcessor,
        {
          provide: DropboxService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
        {
          provide: getModelToken(Post),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        Logger,
      ],
    }).compile();

    processor = module.get<FileUploadProcessor>(FileUploadProcessor);
    dropboxService = module.get<DropboxService>(DropboxService);
    postModel = module.get<typeof Post>(getModelToken(Post));
    userModel = module.get<typeof User>(getModelToken(User));

    errorSpy = jest.spyOn(processor['logger'], 'error');
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleImageUpload', () => {
    it('should upload image and update post model', async () => {
      const mockJob = {
        data: {
          image: {
            originalname: 'test-image.jpg',
            buffer: { data: Buffer.from('some image data') },
          },
          postId: 1,
        },
      };

      const mockPost = {
        postId: 'post123',
        image: null,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(postModel, 'findOne').mockResolvedValue(mockPost as any);
      (dropboxService.uploadImage as jest.Mock).mockResolvedValue(
        'dropbox-url',
      );

      await processor.handleImageUpload(mockJob as any);

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(dropboxService.uploadImage).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(mockPost.save).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('should log an error when image data is invalid', async () => {
      const mockJob = {
        data: {
          image: null,
          postId: 1,
        },
      };

      await processor.handleImageUpload(mockJob as any);

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to upload image to Dropbox: Image data is undefined or invalid',
        expect.anything(),
      );
    });
  });

  describe('handleProfileUpload', () => {
    it('should upload profile image and update user model', async () => {
      const mockJob = {
        data: {
          profile: {
            originalname: 'test-profile.jpg',
            buffer: { data: Buffer.from('some image data') },
          },
          userId: 1,
        },
      };

      const mockUser = {
        userId: 'user123',
        profile: null,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
      (dropboxService.uploadImage as jest.Mock).mockResolvedValue(
        'dropbox-url',
      );

      await processor.handleProfileUpload(mockJob as any);

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(dropboxService.uploadImage).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(mockUser.save).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
    });
  });
});
