const { User, Complaint, Room, GatePass, FeeRecord } = require('../models');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Count Students
    const totalStudents = await User.count({ where: { role: 'student' } });
    
    // 2. Count Pending Issues
    const pendingComplaints = await Complaint.count({ where: { status: 'Pending' } });
    
    // 3. Rooms & Occupancy
    let totalRooms = await Room.count();
    if (totalRooms === 0) totalRooms = 20;

    const occupiedRooms = await User.count({ 
      distinct: true, 
      col: 'roomNumber',
      where: { role: 'student' } 
    });

    // 4. Active Gate Passes
    const pendingGatePasses = await GatePass.count({ where: { status: 'Pending' } });

    // 5. Calculate pending fees from FeeRecord or User sum
    let pendingFees = await FeeRecord.sum('pendingAmount');
    if (!pendingFees || isNaN(pendingFees)) {
      pendingFees = await User.sum('feesPending', { where: { role: 'student' } }) || (totalStudents * 15000);
    }

    // 6. Recent Activity (Fetch recent complaints + gate passes)
    const recentComplaints = await Complaint.findAll({
      limit: 3,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name', 'roomNumber'] }]
    });

    const recentPasses = await GatePass.findAll({
      limit: 2,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name', 'roomNumber'] }]
    });

    const complaintActivities = recentComplaints.map(c => ({
      id: `c_${c.id}`,
      text: `Issue [${c.category}]: ${c.title} (${c.User ? `Room ${c.User.roomNumber}` : 'Hostel'})`,
      time: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: 'alert-circle'
    }));

    const passActivities = recentPasses.map(p => ({
      id: `p_${p.id}`,
      text: `Gate Pass: ${p.User ? p.User.name : 'Student'} (${p.reason})`,
      time: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: 'door-open'
    }));

    const recentActivities = [...complaintActivities, ...passActivities].slice(0, 5);

    res.json({
      totalStudents,
      totalRooms,
      occupiedRooms,
      pendingComplaints,
      pendingGatePasses,
      pendingFees,
      recentActivities
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: err.message });
  }
};