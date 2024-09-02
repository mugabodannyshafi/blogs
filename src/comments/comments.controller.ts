import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  BadRequestException,
  Query,
  Get,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiTags } from '@nestjs/swagger';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Comment } from './entities/comment.entity';
@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post(':id')
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Comment created',
    type: Comment
  })
  @ApiBadRequestResponse({
    description: 'Comment created'
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error'
  })
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() request: Request,
    @Body() createCommentDto: CreateCommentDto,
    @Param('id') postId: string,
  ): Promise<any> {
    console.log(createCommentDto)
    if (!createCommentDto) {
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

    return this.commentsService.create(userId, createCommentDto.comment, postId);
  }

  @Get()
  getComments(@Query('postId') postId: string) {
    return this.commentsService.getComments(postId);
  }
}
