const app = require('./src/app');
const { sequelize } = require('./src/models/index.model');
const seedSettings = require("./src/scripts/seedSettings");

const verifyConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    await sequelize.sync({ alter: true });
    console.log("All database tables synced successfully!");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

verifyConnection();
seedSettings();
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});