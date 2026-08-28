const { Sequelize } = require("sequelize");
require("dotenv").config();

// Sequelize is the "translator" between our JavaScript code and PostgreSQL.
// We give it connection details once here, and every model file below
// uses this same connection.
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false, // set to console.log if you want to see every SQL query Sequelize runs
  }
);

module.exports = sequelize;
