import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post) private readonly postModel: typeof Post) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const { title, content, author } = createPostDto;
    console.log('DTO', createPostDto);

    const post = await this.postModel.create({
      title,
      content,
      author,
      userId,
    });

    return post;
  }

  async findAllPosts(): Promise<Post[]> {
    return this.postModel.findAll();
  }

  async findOne(postId: string): Promise<Post> {
    if (!postId) {
      throw new BadRequestException('Invalid postId');
    }

    const post = await this.postModel.findOne({ where: { postId } });

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    return post;
  }

  async comments(postId: string): Promise<Comment[]> {
    const post = await this.postModel.findOne({ where: { postId } });

    if (!post) {
      throw new NotFoundException('Post not found!');
    }

    return Comment.findAll({ where: { postId } });
  }

  async update(postId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    if (!postId) {
      throw new BadRequestException('Invalid postId');
    }

    const post = await this.postModel.findOne({ where: { postId } });

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
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
  
    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }
  
    await post.destroy();
    return { message: 'Post successfully deleted!' };
  }
  
}
