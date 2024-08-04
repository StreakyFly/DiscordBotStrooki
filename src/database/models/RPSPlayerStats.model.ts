import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Table, Attribute, NotNull, PrimaryKey, Default, Unique } from '@sequelize/core/decorators-legacy';

// TODO update from legacy decorators when possible - https://sequelize.org/docs/v7/models/defining-models/

@Table({
    modelName: 'RPSPlayerStats',
    tableName: 'rps_player_stats',
    underscored: true,
    timestamps: false,
})
export class RPSPlayerStats extends Model<InferAttributes<RPSPlayerStats>, InferCreationAttributes<RPSPlayerStats>> {
    @Attribute(DataTypes.BIGINT)
    @PrimaryKey
    declare userId: bigint;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    @Default(0)
    declare wins: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    @Default(0)
    declare losses: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    @Default(0)
    declare ties: CreationOptional<number>;
}
