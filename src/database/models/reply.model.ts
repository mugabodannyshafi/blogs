import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
  AllowNull,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Post } from './post.model';
import { Comment } from './comment.model';
import { ApiProperty } from '@nestjs/swagger';

@Table({ timestamps: true })
export class Reply extends Model<Reply> {
  @ApiProperty({
    description: 'id',
    example: '2abcc222-0f08-48de-b04e-bc471b55f76a',
  })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  public replyId: string;

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
    description: 'comment',
    example: '2abcc222-0f08-48de-b04e-bc471b55f76a',
  })
  @ForeignKey(() => Comment)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  public commentId: string;

  @ApiProperty({
    description: 'reply',
    example: 'absolutely!',
  })
  @AllowNull(false)
  @Column(DataType.STRING)
  public reply: string;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Post)
  post: Post;

  @BelongsTo(() => Comment)
  comment: Comment;
}
