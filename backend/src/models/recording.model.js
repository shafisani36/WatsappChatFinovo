const {
  DataTypes,
} = require("sequelize");

const sequelize = require(
  "../config/db"
);

const Recording =
  sequelize.define(
    "Recording",
    {
      id: {
        type: DataTypes.UUID,

        defaultValue:
          DataTypes.UUIDV4,

        primaryKey: true,

        allowNull: false,
      },

      userId: {
        type: DataTypes.UUID,

        allowNull: false,
      },

      fileName: {
        type: DataTypes.STRING,

        allowNull: false,
      },

      filePath: {
        type: DataTypes.STRING,

        allowNull: false,
      },

      duration: {
        type: DataTypes.INTEGER,

        allowNull: false,

        defaultValue: 0,
      },

      createdAt: {
        type: DataTypes.DATE,

        allowNull: false,

        defaultValue:
          DataTypes.NOW,
      },
    },

    {
      tableName: "recordings",

      timestamps: false,
    }
  );

module.exports = Recording;