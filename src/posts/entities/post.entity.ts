import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { ApiProperty } from '@nestjs/swagger';

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
}
