const { sequelize, MessMenu } = require('./models');

const clean = async () => {
  try {
    // Delete the specific bad row (or use { truncate: true } to clear whole table)
    await MessMenu.destroy({
      where: { day: 'Mon' }
    });
    console.log("✅ Successfully deleted 'Mon' from Database.");
  } catch (error) {
    console.error("Error:", error);
  }
};

clean();