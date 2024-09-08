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
import { Comment } from 'src/database/models/comment.model';
import { AuthenticatedGuard } from 'src/auth/guards/local.guard';
@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Post(':id')
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
  async create(
    @Req() request: Request,
    @Body() createCommentDto: CreateCommentDto,
    @Param('id') postId: string,
  ): Promise<any> {
    if (!createCommentDto) {
      throw new BadRequestException('Comment is required');
    }
    return this.commentsService.create(request.session.userId, createCommentDto.comment, postId);
  }

  @Get('')
  getComments(@Query('postId') postId: string) {
    return this.commentsService.getComments(postId);
  }
}
