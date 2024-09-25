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
    // Input validation
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    if (!postId) {
      throw new BadRequestException('Post ID is required');
    }
    if (!comment) {
      throw new BadRequestException('Comment is required');
    }

    // Check if user exists
    const user = await this.userModel.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'User not found',
      });
    }

    // Check if post exists before accessing its properties
    const post = await this.postModel.findOne({ where: { postId } });
    if (!post) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post not found',
      });
    }

    // Retrieve the user who created the post
    const postOwner = await this.userModel.findOne({ where: { userId: post.userId } });
    if (!postOwner) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post owner not found',
      });
    }

    // Create new comment
    const newComment = await this.commentModel.create({
      comment,
      userId,
      postId,
    });

    // If comment created successfully, send notification email
    if (newComment) {
      await this.mailService.sendNewCommentEmail(user.username, post.title, comment, postOwner.email);
    }

    return newComment;
  }

  async getComments(postId: string) {
    // Check if post exists
    const post = await this.postModel.findOne({ where: { postId } });
    if (!post) {
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post not found',
      });
    }

    // Retrieve comments for the post
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
