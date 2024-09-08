import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/database/models/user.model';
import { Comment } from 'src/database/models/comment.model';
import { Post } from 'src/database/models/post.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCommentDto } from './dto/create-comment.dto';
import { timestamp } from 'rxjs';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment) private readonly commentModel: typeof Comment,
    @InjectModel(Post) private readonly postModel: typeof Post,
  ) {}
  async create(userId: string, comment: string, postId: string) {
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

    if (post === null) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post not found',
      });
    }

    const newComment = await this.commentModel.create({
      comment,
      userId,
      postId,
    });

    return newComment;
  }

  async getComments(postId: string) {
    const post = await this.postModel.findOne({ where: { postId } });
    if (post === null)
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post not found',
      });
    const comments = await this.commentModel.findAll({ where: { postId } });
    if (comments.length <= 0) throw new NotFoundException({
      timestamp:  new Date(),
      message: 'No comments found',
    })
    return comments;
  }
}
