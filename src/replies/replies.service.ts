import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { Post } from 'src/database/models/post.model';
import { Comment } from 'src/database/models/comment.model';
import { User } from 'src/database/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { Reply } from 'src/database/models/reply.model';
import { timestamp } from 'rxjs';

@Injectable()
export class RepliesService {
  constructor(
    @InjectModel(Post) private readonly postModel: typeof Post,
    @InjectModel(Comment) private readonly commentModel: typeof Comment,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Reply) private readonly replyModel: typeof Reply,
  ) {}

  async create(
    commentId: string,
    userId: string,
    createReplyDto: CreateReplyDto,
  ) {
    const user = await this.userModel.findOne({ where: { userId } });
    if (user === null)
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'User not found',
      });

    const comment = await this.commentModel.findOne({ where: { commentId } });
    if (comment === null)
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Comment not found',
      });

    const post = await this.postModel.findOne({
      where: { postId: comment.postId },
    });
    if (post === null)
      throw new NotFoundException({
        timestamp: new Date(),
        message: 'Post not found',
      });

    const result = await this.replyModel.create({
      userId: userId,
      postId: post.postId,
      commentId: commentId,
      reply: createReplyDto.reply,
    });

    return result;
  }

  async findReplies(commentId: string) {
    const comment = await this.commentModel.findOne({ 
      where: { commentId },
     })

    

     if (comment === null) throw new NotFoundException({
      timestamp: new Date(),
      message: 'Comment not found',
     })
     const replies = await this.replyModel.findAll({
      where: {commentId: comment.commentId}
     })
     return replies
  }
}
