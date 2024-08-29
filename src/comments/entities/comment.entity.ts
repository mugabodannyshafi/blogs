// src/comments/comment.model.ts
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
@Table
export class Comment extends Model<Comment> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  public commentId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public comment: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  public userId: string;

  @ForeignKey(() => Post)
  @Column({
    allowNull: false,
  })
  public postId: string;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Post)
  post: Post;
}
