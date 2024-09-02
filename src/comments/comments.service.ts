import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment) private readonly commentModel: typeof Comment,
    @InjectModel(Post) private readonly postModel: typeof Post,
  ) {}
  async create(userId: string, comment: string, postId: string) {
    console.log('-->userId', userId)
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    if (!postId) {
      throw new BadRequestException('Post ID is required');
    }
    if (!comment) {
      throw new BadRequestException('Comment is required');
    }

    const post = await this.postModel.findOne({ where: { postId: postId } });

    if (!post) {
      throw new NotFoundException('Post Not Found');
    }

    const newComment = await this.commentModel.create({
      comment,
      userId,
      postId,
    });

    return newComment;
  }

  async getComments(postId: string) {
    const comments = await this.commentModel.findAll({ where: { postId } });
    if (comments.length === 0)
      throw new NotFoundException('Comments Not Found');
    return comments;
  }
}
