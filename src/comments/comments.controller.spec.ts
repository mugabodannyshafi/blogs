import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { CreateCommentDto } from './dto/create-comment.dto';

const testComment = {
  comment: 'This is good!',
  userId: 'user-id',
  postId: 'post-id',
};

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            getComments: jest.fn(() => [testComment]),
            create: jest.fn(() => testComment),
          },
        },
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn(() => ({ userId: 'user-id' })),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<CommentsController>(CommentsController);
    service = moduleRef.get<CommentsService>(CommentsService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const request = { headers: { authorization: 'Bearer token' } } as Request;
      const createCommentDto = { comment: 'This is good!' };

      const result = await controller.create(request, createCommentDto as CreateCommentDto, 'post-id');

      expect(result).toEqual(testComment);
      expect(service.create).toHaveBeenCalledWith('user-id', createCommentDto.comment, 'post-id');
    });

    it('should throw BadRequestException if token is missing', async () => {
      const request = { headers: {} } as Request;
      const createCommentDto = { comment: 'This is good!' };

      await expect(controller.create(request, createCommentDto as CreateCommentDto, 'post-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token is invalid', async () => {
      jwtService.decode = jest.fn(() => null);
      const request = { headers: { authorization: 'Bearer token' } } as Request;
      const createCommentDto = { comment: 'This is good!' };

      await expect(controller.create(request, createCommentDto as CreateCommentDto, 'post-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getComments', () => {
    it('should return comments for a post', async () => {
      const result = await controller.getComments('post-id');
      expect(result).toEqual([testComment]);
      expect(service.getComments).toHaveBeenCalledWith('post-id');
    });
  });
});
