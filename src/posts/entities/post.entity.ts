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
  
  @Table
  export class Post extends Model<Post> {
    @Column({
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true,
    })
    public postId: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    public title: string;
  
    @Column({
      type: DataType.TEXT,
      allowNull: false,
    })
    public content: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    public author: string;
  
    @ForeignKey(() => User)
    @Column({
      type: DataType.UUID,
      allowNull: false,
    })
    public userId: string;
  
    @BelongsTo(() => User)
    user: User;
  
    @HasMany(() => Comment)
    comments: Comment[];
  }
  