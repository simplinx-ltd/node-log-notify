/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Table, Column, Model, DataType, AutoIncrement, PrimaryKey } from 'sequelize-typescript';

@Table({
    tableName: 'resource-cpu',
    modelName: 'resource-cpu',
    freezeTableName: true,
    timestamps: false,
})
export default class ResourceCpu extends Model<ResourceCpu> {
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
        allowNull: false,
    })
    process: string;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    value: number;
}
