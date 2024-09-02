import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
  AllowNull,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';
import { ApiProperty } from '@nestjs/swagger';

@Table({ createdAt: true, updatedAt: true })
export class Comment extends Model<Comment> {
  @ApiProperty({
    description: 'id',
    example: '2abcc222-0f08-48de-b04e-bc471b55f76a',
  })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  public commentId: string;

  @ApiProperty({
    description: 'comment',
    example: 'This is good!!',
  })
  @AllowNull(false)
  @Column(DataType.STRING)
  public comment: string;

  @ApiProperty({
    description: 'user',
    example: '2abcc222-0f08-48de-b04e-bc471b55f76a',
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  public userId: string;

  @ApiProperty({
    description: 'post',
    example: '2abcc222-0f08-48de-b04e-bc471b55f76a',
  })
  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  public postId: string;

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

  @BelongsTo(() => Post)
  post: Post;
}
