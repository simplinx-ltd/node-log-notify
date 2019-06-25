import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, AutoIncrement, PrimaryKey } from 'sequelize-typescript';

@Table({
  tableName: 'notification',
  modelName: 'notification',
  freezeTableName: true,
})
export default class Notification extends Model<Notification> {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: false
  })
  type: string;

  @Column({
    type: DataType.STRING(32),
    allowNull: false
  })
  when2Notify: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  maxMessagePerDay: number;

  @Column({
    type: DataType.STRING(128),
    allowNull: false
  })
  emailTo: string;

  @Column({
    type: DataType.STRING(128),
    allowNull: false
  })
  emailFrom: string;

  @Column({
    type: DataType.STRING(512),
    allowNull: false
  })
  emailSubject: string;

  @Column(DataType.TEXT)
  message: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;
}
