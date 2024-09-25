import { Inject, Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from './mail/mail.service';
import { User } from './database/models/user.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class AppService {
  constructor(
    @Inject() private readonly mailService: MailService,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    return 'Hello World!';
  }

  @Cron('28 4 * * 0')
  async handleCron() {
    const users = await this.userModel.findAll();
    const now = new Date();
    const day = now.getDate();
    const weekDay = now.getDay();
    const thirdSunday = Math.ceil((day - weekDay + 1) / 7) === 3;
    
    if (thirdSunday) {
      users.forEach(async (user) => {
        const date_time = now.toLocaleString();
        await this.sendEmailToUser(user.username, date_time, user.email);
      });
    }
    
  }

  async sendEmailToUser(username: string, date_time: any, to: string) {
    await this.mailService.sendScheduledMail(username, date_time, to);
    this.logger.log(`Email sent to ${to}`);
  }
}
