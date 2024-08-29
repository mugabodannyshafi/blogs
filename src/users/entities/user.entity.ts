import {
    Table,
    Column,
    Model,
    PrimaryKey,
    HasMany,
    DataType,
    Default,
    BeforeCreate,
    Unique,
    AllowNull,
  } from 'sequelize-typescript';
  import { Post } from 'src/posts/entities/post.entity';
  import { Comment } from 'src/comments/entities/comment.entity';
  import * as bcrypt from 'bcryptjs';
  
  @Table({ createdAt: true, updatedAt: true })
  export class User extends Model<User> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    public userId: string;
  
    @Unique
    @Column(DataType.STRING(100))
    public email: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    public username: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    public password: string;
  
    @Column(DataType.STRING)
    public otp: string;
  
    @Column(DataType.DATE)
    public otpExpiresAt: Date;
  
    @HasMany(() => Post)
    posts: Post[];
  
    @HasMany(() => Comment)
    comments: Comment[];
  
    @BeforeCreate
    static async hashPassword(user: User) {
      if (user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.getDataValue('password'), salt);
        return user.setDataValue('password', hashedPassword);
      }
    }
  }
  