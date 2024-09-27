import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ createdAt: true, updatedAt: true })
export class SessionEntity extends Model<SessionEntity> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  public sid: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  public expires: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  public data: string;

  @Column(DataType.DATE)
  public createdAt: Date;

  @Column(DataType.DATE)
  public updatedAt: Date;
}
