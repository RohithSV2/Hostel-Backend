const { MessMenu, MessFeedback, User } = require('../models');

// @desc    Get the full weekly menu
// @route   GET /api/mess
exports.getMenu = async (req, res) => {
  try {
    const menus = await MessMenu.findAll();
    const formattedMenu = {};
    
    menus.forEach(entry => {
      formattedMenu[entry.day] = {
        Breakfast: { item: entry.breakfast || 'Not Set', time: '7:30 - 9:00 AM' },
        Lunch: { item: entry.lunch || 'Not Set', time: '12:30 - 2:00 PM' },
        Snacks: { item: entry.snacks || 'Not Set', time: '4:30 - 5:30 PM' },
        Dinner: { item: entry.dinner || 'Not Set', time: '7:30 - 9:00 PM' }
      };
    });

    res.json(formattedMenu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a specific day (Admin)
// @route   POST /api/mess/update
exports.updateMenu = async (req, res) => {
  const { day, breakfast, lunch, snacks, dinner } = req.body;

  try {
    let menu = await MessMenu.findOne({ where: { day } });

    if (menu) {
      await menu.update({ breakfast, lunch, snacks, dinner });
    } else {
      await MessMenu.create({ day, breakfast, lunch, snacks, dinner });
    }
    
    res.json({ success: true, message: `Menu for ${day} updated successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Submit student meal feedback / rating
// @route   POST /api/mess/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { day, mealType, rating, comment, studentId } = req.body;
    const id = studentId || req.user?.id;

    if (!id) return res.status(400).json({ message: 'Student ID is required' });

    const feedback = await MessFeedback.create({
      studentId: id,
      day: day || 'Today',
      mealType: mealType || 'Lunch',
      rating: rating || 5,
      comment: comment || ''
    });

    res.status(201).json({ success: true, message: 'Feedback recorded! Thank you.', feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get average ratings for meals
// @route   GET /api/mess/feedback/stats
exports.getFeedbackStats = async (req, res) => {
  try {
    const feedbacks = await MessFeedback.findAll({
      limit: 50,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name', 'roomNumber'] }]
    });

    const averageRating = feedbacks.length > 0 
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
      : '4.5';

    res.json({
      averageRating: parseFloat(averageRating),
      totalReviews: feedbacks.length,
      recentFeedbacks: feedbacks.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};