const { sequelize, User, Room, Complaint, GatePass, MessMenu, Notice, FeeRecord, LostItem, Message } = require('./models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    console.log('🔄 Syncing and clearing database...');
    await sequelize.sync({ force: true });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash('123456', salt);

    console.log('🌱 Seeding Rooms...');
    const roomsData = [];
    // Floor 1 (Block A)
    for (let i = 1; i <= 10; i++) {
      const roomNumber = `10${i === 10 ? '10' : '0' + i}`.slice(0, 3);
      roomsData.push({
        roomNumber: String(100 + i),
        block: 'A-Block',
        floor: 1,
        capacity: 3,
        type: i % 2 === 0 ? '3-Sharing AC' : '3-Sharing Non-AC',
        rentPerSemester: i % 2 === 0 ? 45000 : 35000,
        status: 'AVAILABLE',
        amenities: 'Study Table, Wardrobe, High-Speed Wi-Fi'
      });
    }
    // Floor 2 (Block A)
    for (let i = 1; i <= 10; i++) {
      roomsData.push({
        roomNumber: String(200 + i),
        block: 'A-Block',
        floor: 2,
        capacity: 3,
        type: '3-Sharing Non-AC',
        rentPerSemester: 35000,
        status: 'AVAILABLE',
        amenities: 'Study Table, Wardrobe, High-Speed Wi-Fi'
      });
    }
    await Room.bulkCreate(roomsData);

    console.log('🌱 Seeding Users (Admin & Students)...');
    const users = await User.bulkCreate([
      {
        name: 'Chief Warden',
        email: 'admin@test.com',
        password: hashPassword,
        role: 'admin',
        phone: '+91 98765 00001',
        block: 'Admin Office'
      },
      {
        name: 'Rohith Sharma',
        email: 'student@test.com',
        password: hashPassword,
        role: 'student',
        roomNumber: '101',
        block: 'A-Block',
        bedId: 'A',
        rollNumber: 'CS2026001',
        phone: '+91 98765 43210',
        guardianName: 'Rajesh Sharma',
        guardianPhone: '+91 99887 76655',
        bloodGroup: 'O+',
        course: 'B.Tech - Computer Science',
        feesPending: 15000,
        checkInStatus: 'In Campus'
      },
      {
        name: 'Rahul Verma',
        email: 'rahul@test.com',
        password: hashPassword,
        role: 'student',
        roomNumber: '101',
        block: 'A-Block',
        bedId: 'B',
        rollNumber: 'CS2026002',
        phone: '+91 98765 43211',
        guardianName: 'Suresh Verma',
        guardianPhone: '+91 98888 11111',
        bloodGroup: 'B+',
        course: 'B.Tech - Computer Science',
        feesPending: 0,
        checkInStatus: 'In Campus'
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@test.com',
        password: hashPassword,
        role: 'student',
        roomNumber: '102',
        block: 'A-Block',
        bedId: 'A',
        rollNumber: 'EC2026010',
        phone: '+91 98765 43212',
        guardianName: 'Venkat Reddy',
        guardianPhone: '+91 97777 22222',
        bloodGroup: 'A+',
        course: 'B.Tech - Electronics',
        feesPending: 25000,
        checkInStatus: 'In Campus'
      },
      {
        name: 'Amit Patel',
        email: 'amit@test.com',
        password: hashPassword,
        role: 'student',
        roomNumber: '102',
        block: 'A-Block',
        bedId: 'B',
        rollNumber: 'ME2026022',
        phone: '+91 98765 43213',
        guardianName: 'Dinesh Patel',
        guardianPhone: '+91 96666 33333',
        bloodGroup: 'AB+',
        course: 'B.Tech - Mechanical',
        feesPending: 10000,
        checkInStatus: 'In Campus'
      },
      {
        name: 'Pooja Iyer',
        email: 'pooja@test.com',
        password: hashPassword,
        role: 'student',
        roomNumber: '103',
        block: 'A-Block',
        bedId: 'A',
        rollNumber: 'CS2026045',
        phone: '+91 98765 43214',
        guardianName: 'Narayanan Iyer',
        guardianPhone: '+91 95555 44444',
        bloodGroup: 'O-',
        course: 'B.Tech - Computer Science',
        feesPending: 0,
        checkInStatus: 'In Campus'
      }
    ]);

    const adminUser = await User.findOne({ where: { email: 'admin@test.com' } });
    const studentUser = await User.findOne({ where: { email: 'student@test.com' } });
    const rahulUser = await User.findOne({ where: { email: 'rahul@test.com' } });

    console.log('🌱 Seeding Mess Menu...');
    await MessMenu.bulkCreate([
      {
        day: 'Mon',
        breakfast: 'Idli & Medu Vada, Coconut Chutney, Sambar, Tea/Coffee',
        lunch: 'Steamed Rice, Dal Tadka, Paneer Butter Masala, Curd, Salad',
        snacks: 'Masala Chai & Vegetable Samosa',
        dinner: 'Phulka Chapati, Mix Veg Curry, Jeera Rice, Gulab Jamun'
      },
      {
        day: 'Tue',
        breakfast: 'Masala Dosa, Sambar, Mint Chutney, Milk/Coffee',
        lunch: 'Jeera Rice, Rajma Masala, Aloo Gobi, Papad, Pickle',
        snacks: 'Filter Coffee & Biscuit assortment',
        dinner: 'Tandoori Roti, Dal Makhani, Veg Pulao, Raita'
      },
      {
        day: 'Wed',
        breakfast: 'Aloo Paratha with White Butter, Curd & Pickle',
        lunch: 'Veg Biryani, Mirchi Ka Salan, Onion Raita, Boondi Ladoo',
        snacks: 'Tea & Onion Pakoda',
        dinner: 'Chapati, Egg / Paneer Curry, Steamed Rice, Rasam'
      },
      {
        day: 'Thu',
        breakfast: 'Poha with Roasted Peanuts, Sev, Jalebi, Tea',
        lunch: 'Rice, Gujarati Kadhi, Bhindi Masala, Phulka, Curd',
        snacks: 'Cold Coffee & Veg Puff',
        dinner: 'Chapati, Malai Kofta, Veg Pulao, Kheer'
      },
      {
        day: 'Fri',
        breakfast: 'Uttapam with Tomato Chutney & Sambar, Tea',
        lunch: 'South Indian Thali: Rice, Sambar, Rasam, Poriyal, Curd',
        snacks: 'Tea & Bread Pakoda',
        dinner: 'Butter Naan, Kadai Paneer, Peas Pulao, Ice Cream'
      },
      {
        day: 'Sat',
        breakfast: 'Poori Bhaji, Halwa, Coffee/Tea',
        lunch: 'Fried Rice, Veg Manchurian Gravy, Hakka Noodles',
        snacks: 'Hot Tea & Corn Chat',
        dinner: 'Chapati, Chana Masala, Steamed Rice, Fruit Custard'
      },
      {
        day: 'Sun',
        breakfast: 'Chole Bhature with Pickled Onions, Sweet Lassi',
        lunch: 'Special Feast: Paneer Tikka / Chicken Biryani, Raita, Rasgulla',
        snacks: 'Tea & Cookies',
        dinner: 'Light Khichdi, Kadhi, Papad, Aloo Chokha'
      }
    ]);

    console.log('🌱 Seeding Complaints...');
    await Complaint.bulkCreate([
      {
        title: 'Ceiling fan regulator not working',
        category: 'Electrical',
        priority: 'High',
        description: 'The ceiling fan only runs on top speed 5. The regulator seems burnt out.',
        status: 'Pending',
        userId: studentUser.id
      },
      {
        title: 'Bathroom water tap leaking continuously',
        category: 'Plumbing',
        priority: 'Normal',
        description: 'Slow leak in the washbasin cold water faucet in room 101 washroom.',
        status: 'In Progress',
        adminRemarks: 'Assigned to plumber Ramesh. Expected fix today by 4 PM.',
        userId: studentUser.id
      },
      {
        title: 'Wi-Fi connectivity drops frequently on 1st Floor',
        category: 'WiFi/Internet',
        priority: 'Urgent',
        description: 'Unable to access online lectures, router LED blinks red during evenings.',
        status: 'Pending',
        userId: rahulUser.id
      },
      {
        title: 'Study table drawer stuck',
        category: 'Carpentry',
        priority: 'Low',
        description: 'Wooden runner alignment fixed.',
        status: 'Resolved',
        adminRemarks: 'Carpentry work completed on 15th.',
        userId: studentUser.id
      }
    ]);

    console.log('🌱 Seeding Gate Passes...');
    await GatePass.bulkCreate([
      {
        reason: 'Weekend Visit to Hometown',
        passType: 'Home Visit',
        from: '2026-10-24',
        to: '2026-10-26',
        departureTime: '06:00 PM',
        returnTime: '08:00 AM',
        destination: 'Bangalore City',
        status: 'Approved',
        parentConsent: 'Granted',
        adminRemarks: 'Permitted. Must report by Monday 8 AM.',
        passToken: 'GP-1-9284',
        studentId: studentUser.id
      },
      {
        reason: 'Academic Seminar at City Science Centre',
        passType: 'Day Out',
        from: '2026-10-20',
        to: '2026-10-20',
        departureTime: '09:00 AM',
        returnTime: '06:30 PM',
        destination: 'Science Centre, Mall Road',
        status: 'Pending',
        parentConsent: 'Granted',
        studentId: studentUser.id
      },
      {
        reason: 'Family function & Cousin Wedding',
        passType: 'Night Stay',
        from: '2026-10-28',
        to: '2026-10-31',
        departureTime: '02:00 PM',
        returnTime: '09:00 PM',
        destination: 'Hyderabad',
        status: 'Pending',
        parentConsent: 'Granted',
        studentId: rahulUser.id
      }
    ]);

    console.log('🌱 Seeding Notices...');
    await Notice.bulkCreate([
      {
        title: 'Maintenance: Water Tank Cleaning',
        content: 'Hostel overhead water tanks will be sanitized this Saturday from 9:00 AM to 1:00 PM. Please store adequate drinking water.',
        priority: 'Important',
        category: 'Maintenance',
        postedBy: 'Chief Warden'
      },
      {
        title: 'Evening Curfew Compliance Reminder',
        content: 'All residents are required to complete biometric check-in by 9:30 PM. Late entries without approved digital gate passes will attract disciplinary remarks.',
        priority: 'Urgent',
        category: 'General',
        postedBy: 'Chief Warden'
      },
      {
        title: 'Inter-Hostel Table Tennis Tournament',
        content: 'Registrations are open for the annual hostel indoor games tournament. Contact sports secretary in Room 204.',
        priority: 'Normal',
        category: 'General',
        postedBy: 'Student Welfare Council'
      }
    ]);

    console.log('🌱 Seeding Fee Records...');
    await FeeRecord.bulkCreate([
      {
        studentId: studentUser.id,
        title: 'Odd Semester Hostel Rent',
        totalAmount: 30000,
        paidAmount: 30000,
        pendingAmount: 0,
        status: 'Paid',
        receiptNumber: 'REC-2026-0041'
      },
      {
        studentId: studentUser.id,
        title: 'Mess & Food Charges',
        totalAmount: 15000,
        paidAmount: 0,
        pendingAmount: 15000,
        status: 'Pending',
        dueDate: '2026-11-15'
      }
    ]);

    console.log('🌱 Seeding Lost & Found...');
    await LostItem.bulkCreate([
      {
        item: 'Boat Airdopes (Black Case)',
        location: 'Mess Dining Hall - Table 4',
        contact: 'Room 101 (Rohith) or Warden Office',
        description: 'Left behind during breakfast hours.',
        type: 'FOUND',
        isResolved: false,
        reportedBy: studentUser.id,
        date: 'Today'
      },
      {
        item: 'Casio fx-991EX Scientific Calculator',
        location: 'Study Reading Hall Floor 2',
        contact: 'Room 102 (Sneha)',
        description: 'Black calculator with a small blue sticker on the back.',
        type: 'LOST',
        isResolved: false,
        reportedBy: rahulUser.id,
        date: 'Yesterday'
      }
    ]);

    console.log('🌱 Seeding Community Chat Messages...');
    await Message.bulkCreate([
      {
        content: 'Welcome to the new academic semester everyone! Please keep the hostel corridors quiet after 10 PM.',
        senderId: adminUser.id, // Admin
        receiverId: null,
        isNotice: true
      },
      {
        content: 'Hey guys, anyone have previous year notes for Data Structures?',
        senderId: studentUser.id,
        receiverId: null,
        isNotice: false
      },
      {
        content: 'Yes Rohith, check Room 102, I have the printed spiral binding book!',
        senderId: rahulUser.id,
        receiverId: null,
        isNotice: false
      }
    ]);

    console.log('✅ DATABASE SUCCESSFULLY SEEDED WITH COMPREHENSIVE PRODUCTION-READY DATA!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;