import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';
import { User } from './database/models/user.model';
import { getModelToken } from '@nestjs/sequelize';

describe('AppController', () => {
  let appController: AppController;
  let mailService: MailService
  let user: typeof User

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
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

    appController = app.get<AppController>(AppController);
    mailService = app.get<MailService>(MailService);
    user = app.get<typeof User>(getModelToken(User));
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  })
});
