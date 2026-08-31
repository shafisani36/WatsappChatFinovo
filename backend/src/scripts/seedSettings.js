const { Settings, Company } = require("../models/index.model");

const seedSettings = async () => {
  try {
    const company = await Company.findOne();
    
    if (!company) {
      console.log("No company found. Please create a company first.");
      return;
    }

    const existingSettings = await Settings.findOne({
      where: { tenantId: company.id },
    });

    if (existingSettings) {
      console.log("Settings already exist for this company.");
      return;
    }

    await Settings.create({
      tenantId: company.id,
      workingHoursPerDay: 8,
      workingDaysPerWeek: 5,
      idleThresholdSeconds: 300, 
      timezone: "UTC",
    });

    console.log("Default settings created successfully.");
  } catch (error) {
    console.error("Error seeding settings:", error.message);
  }
};

module.exports = seedSettings;