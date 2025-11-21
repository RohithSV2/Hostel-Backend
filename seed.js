const sequelize = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // WARNING: This clears DB

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash('123456', salt);

    await User.bulkCreate([
      {
        name: 'Rohith Student',
        email: 'student@test.com',
        password: hashPassword,
        role: 'student',
        roomNumber: '302',
        rollNumber: 'CS001'
      },
      {
        name: 'Hostel Warden',
        email: 'admin@test.com',
        password: hashPassword,
        role: 'admin'
      }
    ]);

    console.log('✅ Database seeded with Test Users!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

seed();