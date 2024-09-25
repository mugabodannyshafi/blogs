import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './database/models/user.model';

describe('AppService', () => {
  let appService: AppService;
  let mailService: MailService;
  let userModel: typeof User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: MailService,
          useValue: {
            sendScheduledMail: jest.fn(),
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
    mailService = module.get<MailService>(MailService);
    userModel = module.get<typeof User>(getModelToken(User));
  });

  it('should return "Hello World!"', () => {
    expect(appService.getHello()).toBe('Hello World!');
  });

  it('should send emails to users on the third Sunday', async () => {
    const mockUsers = [
      { username: 'user1', email: 'user1@example.com' },
      { username: 'user2', email: 'user2@example.com' },
    ];
    jest.spyOn(userModel, 'findAll').mockResolvedValue(mockUsers as any);

    const now = new Date();
    jest.spyOn(global, 'Date').mockImplementation(() => now as any);

    const day = now.getDate();
    const weekDay = now.getDay();
    const thirdSunday = Math.ceil((day - weekDay + 1) / 7) === 3;

    if (thirdSunday) {
      await appService.handleCron();
      expect(mailService.sendScheduledMail).toHaveBeenCalledTimes(mockUsers.length);
      mockUsers.forEach((user) => {
        expect(mailService.sendScheduledMail).toHaveBeenCalledWith(
          user.username,
          now.toLocaleString(),
          user.email,
        );
      });
    } else {
      await appService.handleCron();
      expect(mailService.sendScheduledMail).not.toHaveBeenCalled();
    }
  });

  it('should log email sent', async () => {
    const logSpy = jest.spyOn(appService['logger'], 'log');
    await appService.sendEmailToUser('user1', 'date_time', 'user1@example.com');
    expect(mailService.sendScheduledMail).toHaveBeenCalledWith('user1', 'date_time', 'user1@example.com');
    expect(logSpy).toHaveBeenCalledWith('Email sent to user1@example.com');
  });
});
