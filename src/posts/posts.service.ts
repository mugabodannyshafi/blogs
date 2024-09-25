import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from 'src/database/models/post.model';
import { Comment } from 'src/database/models/comment.model';
import { InjectModel } from '@nestjs/sequelize';
import { timestamp } from 'rxjs';
import { User } from 'src/database/models/user.model';
import { SessionEntity } from 'src/database/models/Sesssion';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post) private readonly postModel: typeof Post,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectQueue('fileUpload') private readonly fileUploadQueue: Queue,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    userId: string,
    imageUrl: any,
  ): Promise<Post> {
    const { title, content, author, image } = createPostDto;
    const user = await this.userModel.findOne({ where: { userId } });
    if (user === null)
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'User not found',
      });
    const post = await this.postModel.create({
      userId,
      title,
      content,
      author,
      image: null,
    });

    if (imageUrl) {
      await this.fileUploadQueue.add(
        'upload-image',
        {
          image: imageUrl,
          postId: post.postId,
        },
        { delay: 3000, lifo: true },
      );
    }
    return post;
  }

  async findAllPosts(query: number) {
    const resultPerPage = 5;
    const currentPage = Number(query) || 1;
    const skip = (currentPage - 1) * resultPerPage;

    return await this.postModel.findAll({
      limit: resultPerPage,
      offset: skip,
    });
  }

  async findOne(postId: string): Promise<Post> {
    // console.log('first', postId)

    const post = await this.postModel.findOne({ where: { postId } });
    if (post === null) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post not found',
      });
    }

    return post;
  }

  async comments(postId: string): Promise<Comment[]> {
    const post = await this.postModel.findOne({ where: { postId } });

    if (post === null) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post not found',
      });
    }

    return Comment.findAll({ where: { postId } });
  }

  async update(
    postId: string,
    updatePostDto: UpdatePostDto,
    imageUrl?: string,
  ): Promise<Post> {
    if (!postId) {
      throw new BadRequestException('Invalid postId');
    }

    const post = await this.postModel.findOne({ where: { postId } });

    if (!post) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post not found',
      });
    }

    post.title = updatePostDto.title ?? post.title;
    post.content = updatePostDto.content ?? post.content;
    post.author = updatePostDto.author ?? post.author;

    if (imageUrl) {
      post.image = imageUrl;
    }

    await post.save();
    return post;
  }

  async remove(postId: string): Promise<{ message: string }> {
    if (!postId) {
      throw new BadRequestException('Invalid postId');
    }

    const post = await this.postModel.findOne({ where: { postId } });

    if (post === null) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post not found',
      });
    }

    await post.destroy();
    return { message: 'Post successfully deleted!' };
  }
}
