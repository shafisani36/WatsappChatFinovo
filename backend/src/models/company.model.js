const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Company = sequelize.define(
  "Company",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("name", value ? value.trim() : value);
      },
    },
    emailDomain: {
      type: DataTypes.STRING,
      allowNull: true,
      set(value) {
        this.setDataValue(
          "emailDomain",
          value ? value.trim().toLowerCase() : value
        );
      },
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "SUSPENDED", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        companyDomainRestriction: {
          enabled: false,
        },
      },
    },
  },
  {
    tableName: "companies", 
    underscored: true,
    timestamps: true,
  }
);

module.exports = Company;