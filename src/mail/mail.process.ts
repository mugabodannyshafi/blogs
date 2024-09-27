import { Process } from '@nestjs/bull';
import { Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MailService } from './mail.service';

@Processor('mailQueue')
export class MailProcessor {
  constructor(private readonly mailService: MailService) {}
  @Process('sendMail')
  async handleSendMail(job: Job) {
    const { to, username } = job.data;
    try {
      await this.mailService.sendRegistrationEMail(to, username);
    } catch (error) {
      throw new Error('Sending Email failed');
    }
  }

  @Process('sendResetMail')
  async handleSendResetMail(job: Job) {
    const { to, token } = job.data;
    try {
      await this.mailService.sendPasswordResetEmail(to, token);
    } catch (error) {
      throw new Error('Sending Email failed');
    }
  }
}
