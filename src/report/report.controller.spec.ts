import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { MailService } from 'src/mail/mail.service';
import { PdfService } from 'src/pdf/generatePdf.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from 'src/database/models/user.model';
import { Comment } from 'src/database/models/comment.model';
import { Reply } from 'src/database/models/reply.model';
import { Post } from 'src/database/models/post.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Request } from 'express';

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

interface CreateReportDto {
  startingDate: Date;
  endingDate: Date;
}

describe('ReportController', () => {
  let controller: ReportController;
  let service: ReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
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

    controller = module.get<ReportController>(ReportController);
    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw a BadRequestException if starting date is greater than or equal to ending date', async () => {
      const createReportDto: CreateReportDto = {
        startingDate: new Date('2023-02-01'),
        endingDate: new Date('2023-01-31'),
      };
  
      const mockRequest = {
        session: {
          userId: 'user1',
        },
      } as unknown as Request;
  
      // Call the actual controller method instead of mocking the service to throw.
      await expect(controller.findOne(mockRequest, createReportDto)).rejects.toThrow(BadRequestException);
    });
  
    it('should throw a BadRequestException if starting date is equal to ending date', async () => {
      const createReportDto: CreateReportDto = {
        startingDate: new Date('2023-01-31'),
        endingDate: new Date('2023-01-31'),
      };
  
      const mockRequest = {
        session: {
          userId: 'user1',
        },
      } as unknown as Request;
  
      await expect(controller.findOne(mockRequest, createReportDto)).rejects.toThrow(BadRequestException);
    });
  });
  
});

