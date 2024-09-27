import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPasswordResetEmail', () => {
    it('should send a password reset email', async () => {
      const to = 'recipient@example.com';
      const token = 'mock-token';

      await service.sendPasswordResetEmail(to, token);

      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Password Reset Request',
        html: expect.stringContaining('Reset Password'),
      });
    });
  });

  describe('sendRegistrationEMail', () => {
    it('should send a registration email', async () => {
      const to = 'newuser@example.com';
      const lastName = 'Doe';

      await service.sendRegistrationEMail(to, lastName);

      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Welcome to my blog posts',
        html: expect.stringContaining('Welcome to my blog posts'),
      });
    });
  });

  describe('sendScheduledMail', () => {
    it('it should send scheduled mail', async () => {
      const to = 'shafi@gmail.com';
      const date_time = new Date();
      const username = 'MUGABO Shafi Danny';

      await service.sendScheduledMail(username, date_time, to);

      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Task alert',
        html: expect.stringContaining(
          'Thank you for your attention to this matter',
        ),
      });
    });
  });
});
