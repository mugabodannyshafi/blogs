import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from 'src/database/models/comment.model';
import { Post } from 'src/database/models/post.model';
import { getModelToken } from '@nestjs/sequelize';
import { User } from 'src/database/models/user.model';
import { MailService } from 'src/mail/mail.service';

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

const mockUser = {
  userId: '157ff5f6-50a6-4abf-a07a-0b4923b1b97c',
  email: 'mugabodannyshafi250@gmail.com',
  username: 'MUGABO Shafi Danny',
  password:
    '$2b$10$WhyPhcoOOg1Xi7UwA.ZCvetmdqjhAFxSd51HcIwr96w2bZROU5ejO',
  password_confirmation:
    '$2b$10$BxKqhJx22fklOnejXEsAiuqp.EnBASCrCGJ4rLrtJ6rcD7XuAKzVK',
  profile:
    'https://res.cloudinary.com/dxizjtfpd/image/upload/v1725963275/lpklfpvcvqpjybyudc9l.png',
  otp: null,
  otpExpiresAt: null,
  createdAt: '2024-09-10T10:14:29.000Z',
  updatedAt: '2024-09-10T10:14:35.000Z',
}

const mockCommentModel = {
  create: jest.fn().mockResolvedValue(mockComment),
  findAll: jest.fn().mockResolvedValue([mockComment]),
};

const mockPostModel = {
  findOne: jest.fn().mockResolvedValue(mockPost),
};

describe('CommentsService', () => {
  let service: CommentsService;
  let commentModel: typeof Comment;
  let postModel: typeof Post;
  let userModel: typeof User
  let mailService: MailService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getModelToken(Comment),
          useValue: mockCommentModel
          ,

        },
        {
          provide: getModelToken(Post),
          useValue: {
            mockPostModel,
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
            mockPost
          }
        },
        {
          provide: MailService,
          useValue: {
            sendNewCommentEmail: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    mailService = module.get<MailService>(MailService);
    commentModel = module.get<typeof Comment>(getModelToken(Comment));
    postModel = module.get<typeof Post>(getModelToken(Post));
    userModel = module.get<typeof User>(getModelToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(
        service.create('', 'This is a comment', 'post1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if postId is missing', async () => {
      await expect(
        service.create('user1', 'This is a comment', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if comment is missing', async () => {
      await expect(service.create('user1', '', 'post1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if post is not found', async () => {
      postModel.findOne = jest.fn().mockResolvedValue(null);
      await expect(
        service.create('user1', 'This is a comment', 'post1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getComments', () => {

    it('should throw NotFoundException if no comments are found', async () => {
      commentModel.findAll = jest.fn().mockResolvedValue([]);
      await expect(service.getComments('post1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if post is not found', async () => {
      postModel.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.getComments('post1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
