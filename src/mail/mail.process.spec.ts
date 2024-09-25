import { TestingModule, Test } from '@nestjs/testing';
import { Job } from 'bull';
import { MailProcessor } from './mail.process';
import { MailService } from './mail.service';

class MockMailService {
  async sendRegistrationEMail(to: string, username: string) {}

  async sendPasswordResetEmail(to: string, token: string) {}
}

describe('MailProcessor', () => {
  let processor: MailProcessor;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailProcessor,
        { provide: MailService, useClass: MockMailService },
      ],
    }).compile();

    processor = module.get<MailProcessor>(MailProcessor);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
    expect(mailService).toBeDefined();
  });

  describe('handleSendMail', () => {
    it('should process sendMail job', async () => {
      const jobData = { to: 'x@example.com', username: 'testuser' };
      const job = { data: jobData } as Job;

      const spySendRegistrationEmail = jest.spyOn(mailService, 'sendRegistrationEMail');

      await processor.handleSendMail(job);

      expect(spySendRegistrationEmail).toHaveBeenCalledWith(jobData.to, jobData.username);
    });
  });

  describe('handleSendResetMail', () => {
    it('should process sendResetMail job', async () => {
      const jobData = { to: 'test@example.com', token: 'reset_token' };
      const job = { data: jobData } as Job;

      const spySendPasswordResetEmail = jest.spyOn(mailService, 'sendPasswordResetEmail');

      await processor.handleSendResetMail(job);

      expect(spySendPasswordResetEmail).toHaveBeenCalledWith(jobData.to, jobData.token);
    });
  });
});
