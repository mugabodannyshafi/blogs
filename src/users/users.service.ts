import { Injectable, NotFoundException } from '@nestjs/common';
import { updateUserDto } from './dto/update-user.dto';
import { User } from 'src/database/models/user.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async findAll() {
    return this.userModel.findAll();
  }

  async findOne(userId: string) {
    const user = await this.userModel.findOne({ where: { userId } });
    if (!user)
      throw new NotFoundException(`User With This id ${userId} Not Found`);
    return user;
  }

  async update(userId: string, updateUserDto: updateUserDto) {
    const user = await this.userModel.findOne({ where: { userId: userId } });
    if (user !== null) {
      const result = await user.update({
        email: updateUserDto.email,
        username: updateUserDto.username,
      });
      if (result) {
        return result;
      }
    } else {
      throw new NotFoundException({
        timestamp: new Date(),
        message: `User with id ${userId} not found`,
      });
    }
  }

  async remove(userId: string) {
    const user = await this.userModel.findOne({  where: { userId }})
    if (user !== null) {
       await user.destroy()
      return {
        statusCode: 204,
        timestamp: new Date(),
        message: `User with id ${userId} has been deleted`,
      }
    } else {
      throw new NotFoundException({
        timestamp: new Date(),
        message: `User with id ${userId} not found`,
      });
    }
  }
}
