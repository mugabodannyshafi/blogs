import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/database/models/user.model';
import { Comment } from 'src/database/models/comment.model';
import { Post } from 'src/database/models/post.model';
import { InjectModel } from '@nestjs/sequelize';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment) private readonly commentModel: typeof Comment,
    @InjectModel(Post) private readonly postModel: typeof Post,
    @Inject() private readonly mailService: MailService,
    @InjectModel(User) private readonly userModel: typeof User
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

    const user = await this.userModel.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'User not found',
      });
    }

    const post = await this.postModel.findOne({ where: { postId } });
    if (!post) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post not found',
      });
    }

    const postOwner = await this.userModel.findOne({ where: { userId: post.userId } });
    if (!postOwner) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post owner not found',
      });
    }

    const newComment = await this.commentModel.create({
      comment,
      userId,
      postId,
    });

    if (newComment) {
      await this.mailService.sendNewCommentEmail(user.username, post.title, comment, postOwner.email);
    }

    return newComment;
  }

  async getComments(postId: string) {
    const post = await this.postModel.findOne({ where: { postId } });
    if (!post) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post not found',
      });
    }

    const comments = await this.commentModel.findAll({ where: { postId } });
    if (comments.length === 0) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'No comments found',
      });
    }

    return comments;
  }
}
