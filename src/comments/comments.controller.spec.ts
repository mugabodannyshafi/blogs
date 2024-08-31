import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

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
      const result = await controller.create(request, 'This is good!', 'post-id');

      expect(result).toEqual(testComment);
      expect(service.create).toHaveBeenCalledWith('user-id', 'This is good!', 'post-id');
    });

    it('should throw BadRequestException if comment is missing', async () => {
      const request = { headers: { authorization: 'Bearer token' } } as Request;
      await expect(controller.create(request, '', 'post-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token is missing', async () => {
      const request = { headers: { } } as Request;
      await expect(controller.create(request, 'This is good!', 'post-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token is invalid', async () => {
      jwtService.decode = jest.fn(() => null);
      const request = { headers: { authorization: 'Bearer token' } } as Request;
      await expect(controller.create(request, 'This is good!', 'post-id')).rejects.toThrow(BadRequestException);
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
