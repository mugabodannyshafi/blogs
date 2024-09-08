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

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post) private readonly postModel: typeof Post,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    userId: string,
    imageUrl: string,
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
      image: imageUrl,
    });

    return post;
  }

  async findAllPosts(): Promise<Post[]> {
    // console.log('--> userId:')
    return this.postModel.findAll();
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

    // Update the fields
    post.title = updatePostDto.title ?? post.title;
    post.content = updatePostDto.content ?? post.content;
    post.author = updatePostDto.author ?? post.author;

    // Update the image URL if a new image was uploaded
    if (imageUrl) {
      post.image = imageUrl;
    }

    // Save the changes
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
