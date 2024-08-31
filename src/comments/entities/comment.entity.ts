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

  @AllowNull(false)
  @Column(DataType.STRING)
  public comment: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,  // Ensure this matches the userId data type in User model
    allowNull: false,
  })
  public userId: string;

  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,  // Explicitly define this as UUID to match postId in Post model
    allowNull: false,
  })
  public postId: string;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Post)
  post: Post;
}
