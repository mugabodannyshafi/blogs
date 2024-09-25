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
import { AuthenticatedGuard } from 'src/auth/guards/local.guard';

@Controller('replies')
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  @UseGuards(AuthenticatedGuard)
  @Post('create-reply/:commendId')
  create(
    @Param('commendId') commentId: string,
    @Req() request: Request,
    @Body() createReplyDto: CreateReplyDto,
  ) {
    return this.repliesService.create(
      commentId,
      request.session.userId,
      createReplyDto,
    );
  }

  @Get('')
  replies(@Query('commentId') commentId: string) {
    return this.repliesService.findReplies(commentId);
  }
}
