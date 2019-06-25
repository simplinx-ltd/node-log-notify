import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, AutoIncrement, PrimaryKey } from 'sequelize-typescript';

@Table({
  tableName: 'resource-memory',
  modelName: 'resource-memory',
  freezeTableName: true,
  timestamps: false
})
export default class ResourceMemory extends Model<ResourceMemory> {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.BIGINT)
  id: number;

  @Column({
    type: DataType.DATE,
  })
  timestamp: Date;

  @Column({
    type: DataType.STRING(32),
    allowNull: false
  })
  process: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false
  })
  value: number;
}
