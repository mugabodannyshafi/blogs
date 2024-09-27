import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { MailService } from 'src/mail/mail.service';
import { PdfService } from 'src/pdf/generatePdf.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from 'src/database/models/user.model';
import { Comment } from 'src/database/models/comment.model';
import { Reply } from 'src/database/models/reply.model';
import { Post } from 'src/database/models/post.model';
import { Op } from 'sequelize';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

const mockMailService = {
  sendDailyReportEmail: jest.fn(),
};

const mockPdfService = {
  generatePDFReport: jest.fn(),
  generateUserPDFReport: jest.fn(),
};

const mockUserModel = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

const mockCommentModel = {
  findAll: jest.fn(),
  count: jest.fn(),
};

const mockReplyModel = {
  findAll: jest.fn(),
  count: jest.fn(),
};

const mockPostModel = {
  findAll: jest.fn(),
};

describe('ReportService', () => {
  let service: ReportService;
  let mailService: MailService;
  let pdfService: PdfService;
  let userModel: typeof User;
  let commentModel: typeof Comment;
  let replyModel: typeof Reply;
  let postModel: typeof Post;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: PdfService,
          useValue: mockPdfService,
        },
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Comment),
          useValue: mockCommentModel,
        },
        {
          provide: getModelToken(Reply),
          useValue: mockReplyModel,
        },
        {
          provide: getModelToken(Post),
          useValue: mockPostModel,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    mailService = module.get<MailService>(MailService);
    pdfService = module.get<PdfService>(PdfService);
    userModel = module.get<typeof User>(getModelToken(User));
    commentModel = module.get<typeof Comment>(getModelToken(Comment));
    replyModel = module.get<typeof Reply>(getModelToken(Reply));
    postModel = module.get<typeof Post>(getModelToken(Post));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const mockUsers = [
      {
        userId: 'user1',
        username: 'JohnDoe',
        email: 'john@example.com',
        profile: 'John Profile',
      },
    ];

    const mockComments = [
      {
        commentId: 'comment1',
        userId: 'user1',
        postId: 'post1',
        comment: 'Great post!',
        createdAt: new Date(),
      },
    ];

    const mockPosts = [
      {
        postId: 'post1',
        userId: 'user1',
        title: 'First Post',
        content: 'This is the first post',
        createdAt: new Date(),
      },
    ];

  });

  describe('findOne', () => {
    const createReportDto = {
      startingDate: new Date('2023-01-01'),
      endingDate: new Date('2023-01-31'),
    };
    const userId = 'user1';

    const mockUser = {
      userId: 'user1',
      username: 'JohnDoe',
      email: 'john@example.com',
      profile: 'John Profile',
    };

    const mockUserComments = [
      {
        commentId: 'comment1',
        userId: 'user1',
        postId: 'post1',
        comment: 'Great post!',
        createdAt: new Date('2023-01-15'),
      },
    ];

    const mockUserPosts = [
      {
        postId: 'post1',
        userId: 'user1',
        title: 'First Post',
        content: 'This is the first post',
        createdAt: new Date('2023-01-10'),
      },
    ];
    it('should throw BadRequestException for invalid date range', async () => {
      const invalidDto = {
        startingDate: new Date('2023-02-01'),
        endingDate: new Date('2023-01-31'),
      };

      await expect(service.findOne(invalidDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne(invalidDto, userId)).rejects.toMatchObject({
        message: 'Invalid date range',
      });
    });

    it('should throw BadRequestException when ending date is in the future', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); 
      const invalidDto = {
        startingDate: new Date('2023-01-01'),
        endingDate: futureDate,
      };

      await expect(service.findOne(invalidDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne(invalidDto, userId)).rejects.toMatchObject({
        message: 'Ending date cannot be in the future',
      });
    });
 });
});
