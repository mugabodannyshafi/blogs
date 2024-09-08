import { PassportSerializer } from '@nestjs/passport';
import { Inject } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/database/models/user.model';

export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    super();
  }

  serializeUser(user: User, done: (err: any, id?: any) => void): void {
    done(null, user.userId);
  }

  async deserializeUser(
    userId: string,
    done: (err: any, user?: any) => void,
  ): Promise<void> {
    // console.log('Deserializing user with ID:', userId);
    try {
      const userDb = await this.usersService.findOne(userId);
      return userDb ? done(null, userDb) : done(null, null);
    } catch (error) {
      done(error);
    }
  }
}
