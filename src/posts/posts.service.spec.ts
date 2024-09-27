import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getModelToken } from '@nestjs/sequelize';
import { Post } from 'src/database/models/post.model';
import { User } from 'src/database/models/user.model';
import { Comment } from 'src/database/models/comment.model';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Queue } from 'bull';

describe('PostsService', () => {
  let service: PostsService;
  let postModel: typeof Post;
  let userModel: typeof User;
  let commentModel: typeof Comment;
  let mockQueue: Queue;

  const mockPost = {
    postId: 'post123',
    userId: 'user123',
    title: 'Test Post',
    content: 'Test content',
    author: 'Test Author',
    image: 'test-image.jpg',
    save: jest.fn(),
    destroy: jest.fn(),
  };

  const mockUser = {
    userId: 'user123',
    username: 'testuser',
  };

  const mockComment = {
    postId: 'post123',
    content: 'Test comment',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            destroy: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(Comment),
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: 'BullQueue_fileUpload',
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postModel = module.get<typeof Post>(getModelToken(Post));
    userModel = module.get<typeof User>(getModelToken(User));
    commentModel = module.get<typeof Comment>(getModelToken(Comment));
    mockQueue = module.get<Queue>('BullQueue_fileUpload');
  });

  describe('create', () => {
    it('should create a new post successfully', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(mockUser);
      postModel.create = jest.fn().mockResolvedValue(mockPost);
      mockQueue.add = jest.fn().mockResolvedValue({});

      const result = await service.create(
        {
          title: 'New Post',
          content: 'New content',
          author: 'Author',
          image: 'image.jpg',
        },
        'user123',
        'image.jpg',
      );

      expect(result).toEqual(mockPost);
      expect(postModel.create).toHaveBeenCalledWith({
        userId: 'user123',
        title: 'New Post',
        content: 'New content',
        author: 'Author',
        image: null,
      });
      expect(mockQueue.add).toHaveBeenCalledWith(
        'upload-image',
        { image: 'image.jpg', postId: mockPost.postId },
        { delay: 3000, lifo: true },
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        service.create(
          {
            title: 'New Post',
            content: 'New content',
            author: 'Author',
            image: 'image.jpg',
          },
          'invalidUserId',
          'image.jpg',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllPosts', () => {
    it('should return all posts', async () => {
      postModel.findAll = jest.fn().mockResolvedValue([mockPost]);

      const result = await service.findAllPosts(5);

      expect(result).toEqual([mockPost]);
      expect(postModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a post by postId', async () => {
      postModel.findOne = jest.fn().mockResolvedValue(mockPost);

      const result = await service.findOne('post123');

      expect(result).toEqual(mockPost);
      expect(postModel.findOne).toHaveBeenCalledWith({
        where: { postId: 'post123' },
      });
    });

    it('should throw NotFoundException if post is not found', async () => {
      postModel.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.findOne('invalidPostId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('comments', () => {

    it('should throw NotFoundException if post is not found', async () => {
      postModel.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.comments('invalidPostId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      postModel.findOne = jest.fn().mockResolvedValue(mockPost);

      const result = await service.update(
        'post123',
        { title: 'Updated Post', content: 'Updated content' },
        'new-image.jpg',
      );

      expect(mockPost.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Post');
      expect(result.image).toBe('new-image.jpg');
    });

    it('should throw NotFoundException if post is not found', async () => {
      postModel.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        service.update('invalidPostId', { title: 'Updated Post' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a post successfully', async () => {
      postModel.findOne = jest.fn().mockResolvedValue(mockPost);

      const result = await service.remove('post123');

      expect(mockPost.destroy).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Post successfully deleted!' });
    });

    it('should throw NotFoundException if post is not found', async () => {
      postModel.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.remove('invalidPostId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
