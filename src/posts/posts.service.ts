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

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post) private readonly postModel: typeof Post) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const { title, content, author, image } = createPostDto;
    // console.log('DTO', createPostDto);

    const post = await this.postModel.create({
      userId,
      title,
      content,
      author,
      image
    });

    return post;
  }

  async findAllPosts(): Promise<Post[]> {
    return this.postModel.findAll();
  }

  async findOne(postId: string): Promise<Post> {

    console.log('first', postId)

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

  async update(postId: string, updatePostDto: UpdatePostDto): Promise<Post> {
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

    post.title = updatePostDto.title ?? post.title;
    post.content = updatePostDto.content ?? post.content;
    post.author = updatePostDto.author ?? post.author;

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
