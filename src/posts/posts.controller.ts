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
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Post as post } from 'src/database/models/post.model';
import { AuthenticatedGuard } from 'src/auth/guards/local.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { count } from 'console';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Post('create-post')
  @ApiCreatedResponse({
    description: 'The post has been successfully created.',
    type: CreatePostDto,
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Rwanda' },
        content: { type: 'string', example: 'Rwanda the heart of africa' },
        author: { type: 'string', example: 'MUGABO Shafi Danny' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Req() request: Request,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<any> {
   const post = this.postsService.create(
      createPostDto,
      request.session.userId,
      image,
    );
    return {
      status: 201,
      message: 'Post created',
    };
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
  findAllPosts(@Query('page') page: number): any {
    return this.postsService.findAllPosts(page);
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

  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({
    description: 'The post has been successfully updated.',
    type: UpdatePostDto, 
  })
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request',
  })
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Rwanda' },
        content: { type: 'string', example: 'Rwanda the heart of africa' },
        author: { type: 'string', example: 'MUGABO Shafi Danny' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    try {
      let imageUrl = null;

      if (image) {
        const uploadedImage = await this.cloudinaryService.uploadImage(image);
        imageUrl = uploadedImage.secure_url;
      }
      return await this.postsService.update(postId, updatePostDto, imageUrl);
    } catch (error) {
      throw new HttpException('Post update failed', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({
    description: 'The post has been successfully updated.',
    type: post,
  })
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request',
  })
  @Put(':id')
  updateOrCreate(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(postId, updatePostDto);
  }

  @UseGuards(AuthenticatedGuard)
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
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }


}
