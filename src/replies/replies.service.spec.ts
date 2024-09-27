import { Test, TestingModule } from '@nestjs/testing';
import { RepliesService } from './replies.service';
import { NotFoundException } from '@nestjs/common';
import { CreateReplyDto } from './dto/create-reply.dto';
import { User } from 'src/database/models/user.model';
import { Comment } from 'src/database/models/comment.model';
import { Reply } from 'src/database/models/reply.model';
import { getModelToken } from '@nestjs/sequelize';
import { Post } from 'src/database/models/post.model';

const mockReply = {
  replyId: '3c409509-1639-49af-b3fc-ebfe1379a672',
  userId: '47b36651-8960-43d7-87cd-15b980096988',
  postId: 'af1ab396-e61a-4e8f-bc08-84c301ac448e',
  commentId: '48d4702d-8f3a-46af-b7f2-24972ecd49db',
  reply: 'for sure',
  updatedAt: '2024-09-17T08:16:30.209Z',
  createdAt: '2024-09-17T08:16:30.209Z',
} as any;

describe('RepliesService', () => {
  let service: RepliesService;
  let userModel: typeof User;
  let commentModel: typeof Comment;
  let replyModel: typeof Reply;
  let postModel: typeof Post;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepliesService,
        {
          provide: getModelToken(Reply),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn()
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
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(Post),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RepliesService>(RepliesService);
    userModel = module.get<typeof User>(getModelToken(User));
    commentModel = module.get<typeof Comment>(getModelToken(Comment));
    replyModel = module.get<typeof Reply>(getModelToken(Reply));
    postModel = module.get<typeof Post>(getModelToken(Post));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if user is not found', async () => {
      const commentId = 'commentId';
      const userId = 'userId';
      const postId = 'postId';
      const createReplyDto: CreateReplyDto = { reply: 'hello' };
      const mockRequest = {
        session: {
          userId: userId,
        },
      } as any;
      userModel.findOne = jest.fn().mockResolvedValue(null);
      await expect(
        service.create(commentId, mockRequest, createReplyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if comment is not found ', async () => {
      const commentId = 'commentId';
      const userId = 'userId';
      const postId = 'postId';
      const createReplyDto: CreateReplyDto = { reply: 'hello' };
      const mockRequest = {
        session: {
          userId: userId,
        },
      } as any;
      commentModel.findOne = jest.fn().mockResolvedValue(null);
      await expect(
        service.create(commentId, mockRequest, createReplyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if post is not found', async () => {
      const commentId = 'commentId';
      const userId = 'userId';
      const postId = 'postId';
      const createReplyDto: CreateReplyDto = { reply: 'hello' };
      const mockRequest = {
        session: {
          userId: userId,
        },
      } as any;
      const mockComment = {
        commentId: '48d4702d-8f3a-46af-b7f2-24972ecd49db',
        comment: 'La is good for sure',
        userId: '47b36651-8960-43d7-87cd-15b980096988',
        postId: 'af1ab396-e61a-4e8f-bc08-84c301ac448e',
        updatedAt: '2024-09-17T08:03:44.601Z',
        createdAt: '2024-09-17T08:03:44.601Z',
      };
      commentModel.findOne = jest.fn().mockResolvedValue(mockComment);

      postModel.findOne = jest.fn().mockResolvedValue(null);
      await expect(
        service.create(commentId, mockRequest, createReplyDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  it('should create new reply', async () => {
    const commentId = 'commentId';
    const userId = 'userId';
    const createReplyDto: CreateReplyDto = { reply: 'hello' };
    const mockRequest = {
      session: {
        userId: userId,
      },
    } as any;

    const mockComment = {
      commentId: '48d4702d-8f3a-46af-b7f2-24972ecd49db',
      comment: 'This is a comment',
      userId: '47b36651-8960-43d7-87cd-15b980096988',
      postId: 'af1ab396-e61a-4e8f-bc08-84c301ac448e',
      updatedAt: '2024-09-17T08:03:44.601Z',
      createdAt: '2024-09-17T08:03:44.601Z',
    };

    const mockPost = { postId: 'af1ab396-e61a-4e8f-bc08-84c301ac448e' };

    userModel.findOne = jest.fn().mockResolvedValue({ userId });
    commentModel.findOne = jest.fn().mockResolvedValue(mockComment);
    postModel.findOne = jest.fn().mockResolvedValue(mockPost);
    replyModel.create = jest.fn().mockResolvedValue({
      userId,
      postId: mockComment.postId,
      commentId,
      reply: createReplyDto.reply,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await service.create(commentId, userId, createReplyDto);

    expect(result).toEqual({
      userId,
      postId: mockComment.postId,
      commentId,
      reply: createReplyDto.reply,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  describe('replies', () => {
    const commentId = 'commentId';
    it('should throw NotFoundException if comment is not found', async () => {
      commentModel.findOne = jest.fn().mockResolvedValue(null)
      await expect(service.findReplies(commentId)).rejects.toThrow(NotFoundException);
    }); 

    it('should get all replies of a post', async () => {
      const commentId = 'commentId'; 
      const mockReplies = [mockReply];

      commentModel.findOne = jest.fn().mockResolvedValue({
        commentId: 'commentId',
      });

      replyModel.findAll = jest.fn().mockResolvedValue(mockReplies);
      const result = await service.findReplies(commentId);
    
      expect(result).toEqual(mockReplies);
    });
    
  })
});
