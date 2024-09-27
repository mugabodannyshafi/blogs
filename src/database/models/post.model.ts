import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Comment } from './comment.model';
import { ApiProperty } from '@nestjs/swagger';
import { Reply } from './reply.model';

@Table({ createdAt: true, updatedAt: true })
export class Post extends Model<Post> {
  @ApiProperty({
    description: 'Post id',
    example: 1,
  })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  public postId: string;

  @ApiProperty({
    description: 'User who created the post',
    example: '12343',
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  public userId: string;

  @ApiProperty({
    description: 'Post title',
    example: 'Post title',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public title: string;

  @ApiProperty({
    description: 'Post content',
    example: 'Post content',
  })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  public content: string;

  @ApiProperty({
    description: 'User who created the post',
    example: 'Shafi',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public author: string;

  @ApiProperty({
    description: 'post image',
    example:
      'https://static.independent.co.uk/2023/07/07/10/iStock-515064346.jpg?quality=75&width=1200&auto=webp',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public image: string;

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

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => Comment)
  comments: Comment[];

  @HasMany(() => Reply)
  replies: Reply[];
}
