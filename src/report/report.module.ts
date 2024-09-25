import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/database/models/user.model';
import { Post } from 'src/database/models/post.model';
import { Comment } from 'src/database/models/comment.model';
import { Reply } from 'src/database/models/reply.model';
import { MailService } from 'src/mail/mail.service';
import { PdfService } from 'src/pdf/generatePdf.service';
import { HtmlEmails } from 'src/pdf/utils/HtmlEmails';

@Module({
  imports: [SequelizeModule.forFeature([User, Post, Comment, Reply])],
  controllers: [ReportController],
  providers: [ReportService, MailService, PdfService, HtmlEmails],
})
export class ReportModule {}
