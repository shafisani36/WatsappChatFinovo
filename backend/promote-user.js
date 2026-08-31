require("dotenv").config();
const { sequelize, User } = require("./src/models/index.model");

const EMAIL_TO_PROMOTE = "mahirprasla@gmail.com";

(async () => {
  try {
    await sequelize.authenticate();

    const user = await User.findOne({ where: { email: EMAIL_TO_PROMOTE } });
    if (!user) {
      console.log("User not found with email:", EMAIL_TO_PROMOTE);
      process.exit(1);
    }

    user.role = "COMPANY_ADMIN";
    await user.save();

    console.log("Promoted:", user.email, "-> role is now", user.role);
    process.exit(0);
  } catch (error) {
    console.error("Promote failed:", error.message);
    process.exit(1);
  }
})();