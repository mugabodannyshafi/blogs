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

    // it('should send daily reports to all users', async () => {
    //   // Arrange
    //   userModel.findAll.mockResolvedValue(mockUsers);
    //   commentModel.findAll.mockResolvedValue(mockComments);
    //   postModel.findAll.mockResolvedValue(mockPosts);
    //   mockReplyModel.count.mockResolvedValue(1); // One reply per comment
    //   pdfService.generatePDFReport.mockResolvedValue('/path/to/report.pdf');
    //   mailService.sendDailyReportEmail.mockResolvedValue(true);
    //   fs.unlinkSync = jest.fn();

    //   // Act
    //   const result = await service.findAll();

    //   // Assert
    //   expect(userModel.findAll).toHaveBeenCalled();
    //   expect(commentModel.findAll).toHaveBeenCalledWith({
    //     where: {
    //       userId: 'user1',
    //       createdAt: expect.any(Object),
    //     },
    //   });
    //   expect(postModel.findAll).toHaveBeenCalledWith({
    //     where: {
    //       userId: 'user1',
    //       createdAt: expect.any(Object),
    //     },
    //   });
    //   expect(commentModel.findAll).toHaveBeenCalledWith({
    //     where: {
    //       postId: 'post1',
    //       createdAt: expect.any(Object),
    //     },
    //   });
    //   expect(replyModel.count).toHaveBeenCalledWith({
    //     where: {
    //       commentId: 'comment1',
    //       createdAt: expect.any(Object),
    //     },
    //   });
    //   expect(pdfService.generatePDFReport).toHaveBeenCalledWith(
    //     'JohnDoe',
    //     1, // Number of posts
    //     1, // Number of user comments
    //     1, // Received comments count
    //     'Great post!',
    //     'John Profile',
    //   );
    //   expect(mailService.sendDailyReportEmail).toHaveBeenCalledWith(
    //     'JohnDoe',
    //     1,
    //     1,
    //     1,
    //     'Great post!',
    //     'john@example.com',
    //     '/path/to/report.pdf',
    //   );
    //   expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/report.pdf');
    //   expect(result).toEqual({ message: 'All reports sent to users' });
    // });

    // it('should handle no users gracefully', async () => {
    //   // Arrange
    //   userModel.findAll.mockResolvedValue([]);

    //   // Act
    //   const result = await service.findAll();

    //   // Assert
    //   expect(userModel.findAll).toHaveBeenCalled();
    //   expect(pdfService.generatePDFReport).not.toHaveBeenCalled();
    //   expect(mailService.sendDailyReportEmail).not.toHaveBeenCalled();
    //   expect(fs.unlinkSync).not.toHaveBeenCalled();
    //   expect(result).toEqual({ message: 'All reports sent to users' });
    // });

    // it('should handle errors gracefully', async () => {
    //   // Arrange
    //   userModel.findAll.mockRejectedValue(new Error('Database error'));

    //   // Act & Assert
    //   await expect(service.findAll()).rejects.toThrow('Database error');
    // });
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

    // it('should generate a PDF report successfully', async () => {
    //   // Arrange
    //   userModel.findOne.mockResolvedValue(mockUser);
    //   commentModel.findAll.mockResolvedValue(mockUserComments);
    //   postModel.findAll.mockResolvedValue(mockUserPosts);
    //   commentModel.findAll.mockResolvedValue(mockUserComments);
    //   mockReplyModel.count.mockResolvedValue(1);
    //   pdfService.generateUserPDFReport.mockResolvedValue('/path/to/user_report.pdf');

    //   // Act
    //   const result = await service.findOne(createReportDto, userId);

    //   // Assert
    //   expect(userModel.findOne).toHaveBeenCalledWith({ where: { userId } });
    //   expect(commentModel.findAll).toHaveBeenCalledWith({
    //     where: {
    //       userId: 'user1',
    //       createdAt: {
    //         [Op.between]: [createReportDto.startingDate, createReportDto.endingDate],
    //       },
    //     },
    //   });
    //   expect(postModel.findAll).toHaveBeenCalledWith({
    //     where: {
    //       userId: 'user1',
    //       createdAt: {
    //         [Op.between]: [createReportDto.startingDate, createReportDto.endingDate],
    //       },
    //     },
    //   });
    //   expect(commentModel.findAll).toHaveBeenCalledWith({
    //     where: {
    //       postId: 'post1',
    //       createdAt: {
    //         [Op.between]: [createReportDto.startingDate, createReportDto.endingDate],
    //       },
    //     },
    //   });
    //   expect(replyModel.count).toHaveBeenCalledWith({
    //     where: {
    //       commentId: 'comment1',
    //       createdAt: {
    //         [Op.between]: [createReportDto.startingDate, createReportDto.endingDate],
    //       },
    //     },
    //   });
    //   expect(pdfService.generateUserPDFReport).toHaveBeenCalledWith(
    //     'JohnDoe',
    //     1, // Number of posts
    //     1, // Number of user comments
    //     1, // Received comments count
    //     'Great post!',
    //     'John Profile',
    //   );
    //   expect(result).toEqual({ message: 'PDF report generated successfully' });
    // });

    it('should throw BadRequestException for invalid date range', async () => {
      // Arrange
      const invalidDto = {
        startingDate: new Date('2023-02-01'),
        endingDate: new Date('2023-01-31'),
      };

      // Act & Assert
      await expect(service.findOne(invalidDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne(invalidDto, userId)).rejects.toMatchObject({
        message: 'Invalid date range',
      });
    });

    it('should throw BadRequestException when ending date is in the future', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
      const invalidDto = {
        startingDate: new Date('2023-01-01'),
        endingDate: futureDate,
      };

      // Act & Assert
      await expect(service.findOne(invalidDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne(invalidDto, userId)).rejects.toMatchObject({
        message: 'Ending date cannot be in the future',
      });
    });

    // it('should throw BadRequestException if user is not found', async () => {
    //   // Arrange
    //   userModel.findOne.mockResolvedValue(null);

    //   // Act & Assert
    //   await expect(service.findOne(createReportDto, userId)).rejects.toThrow(BadRequestException);
    //   await expect(service.findOne(createReportDto, userId)).rejects.toMatchObject({
    //     message: 'Cannot read property \'userId\' of null', // Adjust based on actual error handling
    //   });
    // });

    // it('should handle no posts or comments gracefully', async () => {
    //   // Arrange
    //   userModel.findOne.mockResolvedValue(mockUser);
    //   commentModel.findAll.mockResolvedValue([]);
    //   postModel.findAll.mockResolvedValue([]);
    //   pdfService.generateUserPDFReport.mockResolvedValue('/path/to/user_report.pdf');

    //   // Act
    //   const result = await service.findOne(createReportDto, userId);

    //   // Assert
    //   expect(commentModel.findAll).toHaveBeenCalledWith({
    //     where: {
    //       userId: 'user1',
    //       createdAt: {
    //         [Op.between]: [createReportDto.startingDate, createReportDto.endingDate],
    //       },
    //     },
    //   });
    //   expect(postModel.findAll).toHaveBeenCalledWith({
    //     where: {
    //       userId: 'user1',
    //       createdAt: {
    //         [Op.between]: [createReportDto.startingDate, createReportDto.endingDate],
    //       },
    //     },
    //   });
    //   expect(pdfService.generateUserPDFReport).toHaveBeenCalledWith(
    //     'JohnDoe',
    //     0, // Number of posts
    //     0, // Number of user comments
    //     0, // Received comments count
    //     'At this time no comment with any reply',
    //     'John Profile',
    //   );
    //   expect(result).toEqual({ message: 'PDF report generated successfully' });
    // });

    //   it('should handle errors gracefully', async () => {
    //     // Arrange
    //     userModel.findOne.mockRejectedValue(new Error('Database error'));

    //     // Act & Assert
    //     await expect(service.findOne(createReportDto, userId)).rejects.toThrow('Database error');
    //   });
    // });
  });
});
