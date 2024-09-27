import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RepliesService } from './replies.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { Reply } from 'src/database/models/reply.model';

@ApiTags('replies')
@Controller('replies')
export class RepliesController {
  constructor(
    private readonly repliesService: RepliesService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Reply created successfully',
    type: Reply,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request',
  })
  @ApiForbiddenResponse({
    description: 'forbidden resource',
  })
  @UseGuards(JwtAuthGuard)
  @Post('create-reply/:commendId')
  create(
    @Param('commendId') commentId: string,
    @Req() request: Request,
    @Body() createReplyDto: CreateReplyDto,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.repliesService.create(commentId, json.userId, createReplyDto);
  }

  @Get('')
  replies(@Query('commentId') commentId: string) {
    return this.repliesService.findReplies(commentId);
  }
}
