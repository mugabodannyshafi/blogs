import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
