const cron=require("node-cron")
const User=require("../models/userModel")

module.exports = () => {
    cron.schedule("*/30 * * * *", async () => {
      const thirtyMinutesAgo = new Date(Date.now() + 30 * 60 * 1000);
      await User.deleteMany({
        accountVerified: false,
        createdAt: { $lt: thirtyMinutesAgo },
      });
    });
  };
