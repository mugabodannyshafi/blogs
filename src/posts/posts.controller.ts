import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Post as post } from './entities/post.entity';
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('')
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The post has been successfully created.',
    type: post
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request',
  })
  @UseGuards(JwtAuthGuard)
  create(
    @Req() request: Request,
    @Body() createPostDto: CreatePostDto,
  ): Promise<any> {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.postsService.create(createPostDto, json.userId);
  }

  @ApiOkResponse({
    description: 'The comments of post has been successfully retrieved.',
  })
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  @Get(':id/comments')
  comments(@Param('id') id: string) {
    return this.postsService.comments(id);
  }

  @Get()
  findAllPosts(): any {
    return this.postsService.findAllPosts();
  }

  @ApiOkResponse({
    description: 'Post with returned',
    type: post,
  })
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The post has been successfully updated.',
    type: post
  })
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request',
  })
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') postId: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(postId, updatePostDto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The post has been successfully updated.',
    type: post
  })
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request',
  })
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateOrCreate(@Param('id') postId: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(postId, updatePostDto);
  }

  @ApiBearerAuth()
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  @ApiOkResponse({
    description: 'The post has been successfully deleted',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request',
  })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
