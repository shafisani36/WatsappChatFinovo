require("dotenv").config();
const { sequelize, Company } = require("./src/models/index.model");

(async () => {
  try {
    await sequelize.authenticate();

    const [company, created] = await Company.findOrCreate({
      where: { id: "cad37dcd-302b-493f-b4f2-986fc3bf3619" },
      defaults: {
        name: "Finovo Global",
        status: "ACTIVE",
      },
    });

    if (created) {
      console.log("Company created:", company.id, company.name);
    } else {
      console.log("Company already exists:", company.id, company.name);
    }

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
})();
