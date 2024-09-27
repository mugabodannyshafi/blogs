import { Test, TestingModule } from '@nestjs/testing';
import { RepliesController } from './replies.controller';
import { RepliesService } from './replies.service';
import { NotFoundException } from '@nestjs/common';
import { CreateReplyDto } from './dto/create-reply.dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

describe('RepliesController', () => {
  let controller: RepliesController;
  let service: RepliesService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepliesController],
      providers: [
        {
          provide: RepliesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findReplies: jest.fn(),
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

    controller = module.get<RepliesController>(RepliesController);
    service = module.get<RepliesService>(RepliesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if user is not found', async () => {
      const commentId = 'commentId';
      const userId = 'userId';
      const createReplyDto: CreateReplyDto = { reply: 'hello' };

      const mockRequest = {
        headers: { authorization: 'Bearer token' },
      } as Request;

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(
        controller.create(commentId, mockRequest, createReplyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if comment is not found', async () => {
      const commentId = 'commentId';
      const userId = 'userId';
      const createReplyDto: CreateReplyDto = { reply: 'hello' };

      const mockRequest = {
        headers: { authorization: 'Bearer token' },
      } as Request;

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new NotFoundException('Comment not found'));

      await expect(
        controller.create(commentId, mockRequest, createReplyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if post is not found', async () => {
      const commentId = 'commentId';
      const userId = 'userId';
      const createReplyDto: CreateReplyDto = { reply: 'hello' };

      const mockRequest = {
        headers: { authorization: 'Bearer token' },
      } as Request;

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(
        controller.create(commentId, mockRequest, createReplyDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getReplies', () => {
    const commendId = 'commentId';
    it('should throw NotFoundException if comment is not found', async () => {
      jest
        .spyOn(service, 'findReplies')
        .mockRejectedValue(new NotFoundException('Comment not found'));

      await expect(controller.replies(commendId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
