const { User, Complaint } = require('../models');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Count Students
    const totalStudents = await User.count({ where: { role: 'student' } });
    
    // 2. Count Pending Issues
    const pendingComplaints = await Complaint.count({ where: { status: 'Pending' } });
    
    // 3. Calculate Occupancy (Unique rooms that have students)
    const totalRooms = 20; // Based on our grid size
    const occupiedRooms = await User.count({ 
      distinct: true, 
      col: 'roomNumber',
      where: { role: 'student' } 
    });
    
    // 4. Fake Fees (Logic: 15k per student)
    const pendingFees = totalStudents * 15000; 

    // 5. Recent Activity (Fetch last 3 complaints)
    const recentComplaints = await Complaint.findAll({
        limit: 3,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, attributes: ['name', 'roomNumber'] }]
    });

    const recentActivities = recentComplaints.map(c => ({
        id: c.id,
        text: `New Issue: ${c.category} (${c.User ? c.User.roomNumber : 'Unknown'})`,
        time: new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        icon: 'alert-circle'
    }));

    res.json({
      totalStudents,
      totalRooms,
      occupiedRooms,
      pendingComplaints,
      pendingFees,
      recentActivities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};