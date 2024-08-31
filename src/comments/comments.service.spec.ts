import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { getModelToken } from '@nestjs/sequelize';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const testComment = {
  comment: 'This is good!',
  userId: 'user-id',
  postId: 'post-id',
};

describe('CommentsService', () => {
  let service: CommentsService;
  let model: typeof Comment;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getModelToken(Comment),
          useValue: {
            create: jest.fn().mockResolvedValue(testComment),
            findAll: jest.fn().mockResolvedValue([testComment]), // default behavior
            findOne: jest.fn().mockResolvedValue(testComment), // default behavior
          },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    model = module.get<typeof Comment>(getModelToken(Comment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const result = await service.create('user-id', 'This is good!', 'post-id');
      expect(result).toEqual(testComment);
      expect(model.create).toHaveBeenCalledWith({
        comment: 'This is good!',
        userId: 'user-id',
        postId: 'post-id',
      });
    });

    it('should throw BadRequestException if userId is not provided', async () => {
      await expect(service.create('', 'This is good!', 'post-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if postId is not provided', async () => {
      await expect(service.create('user-id', 'This is good!', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if comment is not provided', async () => {
      await expect(service.create('user-id', '', 'post-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if post is not found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(null); // Simulate post not found
      await expect(service.create('user-id', 'This is good!', 'invalid-post-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getComments', () => {
    it('should return all comments for a post', async () => {
      const result = await service.getComments('post-id');
      expect(result).toEqual([testComment]);
      expect(model.findAll).toHaveBeenCalledWith({ where: { postId: 'post-id' } });
    });

    it('should throw NotFoundException if no comments are found', async () => {
      jest.spyOn(model, 'findAll').mockResolvedValueOnce([]); // Simulate no comments found
      await expect(service.getComments('invalid-post-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
