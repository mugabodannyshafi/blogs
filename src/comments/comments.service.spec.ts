import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from 'src/database/models/comment.model';
import { Post } from 'src/database/models/post.model';
import { getModelToken } from '@nestjs/sequelize';
import { CreateCommentDto } from './dto/create-comment.dto';

const mockComment = {
  commentId: '1',
  comment: 'This is a comment',
  userId: 'user1',
  postId: 'post1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPost = {
  postId: 'post1',
  title: 'Post Title',
  content: 'Post Content',
  author: 'Author',
  userId: 'user1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCommentModel = {
  create: jest.fn().mockResolvedValue(mockComment),
  findAll: jest.fn().mockResolvedValue([mockComment]),
  findOne: jest.fn().mockResolvedValue(mockPost),
};

const mockPostModel = {
  findOne: jest.fn().mockResolvedValue(mockPost),
};

describe('CommentsService', () => {
  let service: CommentsService;
  let commentModel: typeof Comment;
  let postModel: typeof Post;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getModelToken(Comment),
          useValue: mockCommentModel,
        },
        {
          provide: getModelToken(Post),
          useValue: mockPostModel,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentModel = module.get<typeof Comment>(getModelToken(Comment));
    postModel = module.get<typeof Post>(getModelToken(Post));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const result = await service.create('user1', 'This is a comment', 'post1');
      expect(result).toEqual(mockComment);
      expect(commentModel.create).toHaveBeenCalledWith({
        comment: 'This is a comment',
        userId: 'user1',
        postId: 'post1',
      });
    });

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(service.create('', 'This is a comment', 'post1'))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException if postId is missing', async () => {
      await expect(service.create('user1', 'This is a comment', ''))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException if comment is missing', async () => {
      await expect(service.create('user1', '', 'post1'))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw NotFoundException if post is not found', async () => {
      postModel.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.create('user1', 'This is a comment', 'post1'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('getComments', () => {
    it('should return comments for a post', async () => {
      const result = await service.getComments('post1');
      expect(result).toEqual([mockComment]);
      expect(commentModel.findAll).toHaveBeenCalledWith({ where: { postId: 'post1' } });
    });

    it('should throw NotFoundException if no comments are found', async () => {
      commentModel.findAll = jest.fn().mockResolvedValue([]);
      await expect(service.getComments('post1'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
