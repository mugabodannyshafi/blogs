import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  BadRequestException,
  Query,
  Get,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post(':id')
  async create(
    @Req() request: Request,
    @Body('comment') comment: string,
    @Param('id') postId: string,
  ): Promise<any> {
    if (!comment) {
      throw new BadRequestException('Comment is required');
    }

    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new BadRequestException('token is missing');
    }

    const decodedToken = this.jwtService.decode(token);
    if (
      !decodedToken ||
      typeof decodedToken === 'string' ||
      !('userId' in decodedToken)
    ) {
      throw new BadRequestException('Invalid token');
    }

    const { userId } = decodedToken as { userId: string };

    return this.commentsService.create(userId, comment, postId);
  }

  @Get()
  getComments(@Query('postId') postId: string) {
    return this.commentsService.getComments(postId);
  }
}
