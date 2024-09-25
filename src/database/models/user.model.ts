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
  import { Post } from './post.model';
  import { Comment } from './comment.model';
  import * as bcrypt from 'bcryptjs';
  import { ApiProperty } from '@nestjs/swagger';
  import { Reply } from './reply.model';
  
  @Table({ createdAt: true, updatedAt: true })
  export class User extends Model<User> {
    @ApiProperty({
      description: 'User ID',
      example: '1',
    })
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    public userId: string;
  
    @ApiProperty({
      description: 'Email',
      example: 'mugabodannyshafi@gmail.com',
    })
    @Unique
    @Column(DataType.STRING(100))
    public email: string;
  
    @ApiProperty({
      description: 'Username',
      example: 'mugabodannyshafi',
    })
    @AllowNull(false)
    @Column(DataType.STRING)
    public username: string;
  
    @ApiProperty({
      description: 'Password',
      example: 'password123',
    })
    @AllowNull(false)
    @Column(DataType.STRING)
    public password: string;
  
    @ApiProperty({
      description: 'Confirm Password',
      example: 'password123',
    })
    @AllowNull(false)
    @Column(DataType.STRING)
    public password_confirmation: string;
  
    @ApiProperty({
      description: 'post image',
      example:
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png',
    })
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    public profile: string;
  
    @Column(DataType.STRING)
    public otp: string;
  
    @Column(DataType.DATE)
    public otpExpiresAt: Date;
  
    @ApiProperty({
      description: 'Created At',
      example: '2024-09-01T12:00:00Z',
    })
    @Column(DataType.DATE)
    public createdAt: Date;
  
    @ApiProperty({
      description: 'Updated At',
      example: '2024-09-01T12:00:00Z',
    })
    @Column(DataType.DATE)
    public updatedAt: Date;
  
    @HasMany(() => Post)
    posts: Post[];
  
    @HasMany(() => Comment)
    comments: Comment[];

    @HasMany(() => Reply)
    replies: Reply[];
  }
  