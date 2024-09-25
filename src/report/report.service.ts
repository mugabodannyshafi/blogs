import {
  Injectable,
  Logger,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { User } from 'src/database/models/user.model';
import { Comment } from 'src/database/models/comment.model';
import { Reply } from 'src/database/models/reply.model';
import { Post } from 'src/database/models/post.model';
import { InjectModel } from '@nestjs/sequelize';
import { MailService } from 'src/mail/mail.service';
import * as fs from 'fs';
import { PdfService } from 'src/pdf/generatePdf.service';
import { Op } from 'sequelize';
import { timestamp } from 'rxjs';


@Injectable()
export class ReportService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Comment) private readonly commentModel: typeof Comment,
    @InjectModel(Reply) private readonly replyModel: typeof Reply,
    @InjectModel(Post) private readonly postModel: typeof Post,
    @Inject() private readonly mailService: MailService,
    @Inject() private readonly pdfService: PdfService,
  ) {}

  private readonly logger = new Logger(ReportService.name);

  // @Cron('*/20 * * * * *')
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Sending daily reports to all users');
    await this.findAll();
  }

  async findAll() {
    const users = await this.userModel.findAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of users) {
      const userComments = await this.commentModel.findAll({
        where: {
          userId: user.userId,
          createdAt: { [Op.gte]: today },
        },
      });

      const posts = await this.postModel.findAll({
        where: {
          userId: user.userId,
          createdAt: { [Op.gte]: today },
        },
      });

      let receivedCommentsCount = 0;
      let commentWithTheMostReplies: any = '';
      let maxRepliesCount = 0;

      for (const post of posts) {
        const receivedComments = await this.commentModel.findAll({
          where: {
            postId: post.postId,
            createdAt: { [Op.gte]: today },
          },
        });
        receivedCommentsCount += receivedComments.length;

        for (const comment of receivedComments) {
          const repliesCount = await this.replyModel.count({
            where: {
              commentId: comment.commentId,
              createdAt: { [Op.gte]: today },
            },
          });
          if (repliesCount > maxRepliesCount) {
            maxRepliesCount = repliesCount;
            commentWithTheMostReplies = comment;
          }
        }
      }

      const pdfPath = await this.pdfService.generatePDFReport(
        user.username,
        posts.length,
        userComments.length,
        receivedCommentsCount,
        commentWithTheMostReplies.comment || `No replies today`,
        user.profile,
      );

      const result = await this.mailService.sendDailyReportEmail(
        user.username,
        posts.length,
        userComments.length,
        receivedCommentsCount,
        commentWithTheMostReplies.comment || `No replies today`,
        user.email,
        pdfPath,
      );

      fs.unlinkSync(pdfPath);
    }

    this.logger.log('Reports sent to all users');
    return { message: 'All reports sent to users' };
  }

  async findOne(createReportDto: CreateReportDto, userId: string) {
    if (createReportDto.startingDate >= createReportDto.endingDate)
      throw new BadRequestException({
        timestamp: new Date(),
        message: 'Invalid date range',
      });

    const currentDate = new Date();
    if (new Date(createReportDto.endingDate) > currentDate) {
      throw new BadRequestException({
        timestamp: currentDate,
        message: 'Ending date cannot be in the future',
      });
    }
    const user = await this.userModel.findOne({ where: { userId } });

    if (user === null) throw new NotFoundException({
      timestamp: new Date(),
      message: 'User not found'
    })

    const userComments = await this.commentModel.findAll({
      where: {
        userId: user.userId,
        createdAt: {
          [Op.between]: [
            createReportDto.startingDate,
            createReportDto.endingDate,
          ],
        },
      },
    });

    const posts = await this.postModel.findAll({
      where: {
        userId: user.userId,
        createdAt: {
          [Op.between]: [
            createReportDto.startingDate,
            createReportDto.endingDate,
          ],
        },
      },
    });

    let receivedCommentsCount = 0;
    let commentWithTheMostReplies: any = '';
    let maxRepliesCount = 0;

    for (const post of posts) {
      const receivedComments = await this.commentModel.findAll({
        where: {
          postId: post.postId,
          createdAt: {
            [Op.between]: [
              createReportDto.startingDate,
              createReportDto.endingDate,
            ],
          },
        },
      });
      receivedCommentsCount += receivedComments.length;

      for (const comment of receivedComments) {
        const repliesCount = await this.replyModel.count({
          where: {
            commentId: comment.commentId,
            createdAt: {
              [Op.between]: [
                createReportDto.startingDate,
                createReportDto.endingDate,
              ],
            },
          },
        });
        if (repliesCount > maxRepliesCount) {
          maxRepliesCount = repliesCount;
          commentWithTheMostReplies = comment;
        }
      }
    }

    await this.pdfService.generateUserPDFReport(
      user.username,
      posts.length,
      userComments.length,
      receivedCommentsCount,
      commentWithTheMostReplies.comment ||
        'At this time no comment with any reply',
      user.profile,
    );

    return {
      message: 'PDF report generated successfully',
    };
  }
}
