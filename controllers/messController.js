const { MessMenu } = require('../models');

// @desc    Get the full weekly menu
// @route   GET /api/mess
exports.getMenu = async (req, res) => {
  try {
    const menus = await MessMenu.findAll();
    const formattedMenu = {};
    
    menus.forEach(entry => {
      formattedMenu[entry.day] = {
        // FRONTEND KEY (Capitalized) : DB VALUE (lowercase)
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
  console.log(`[DEBUG] Data:`, req.body);
  const { day, breakfast, lunch, snacks, dinner } = req.body;
  
  console.log(`[DEBUG] Received Update Request for: ${day}`);
  

  try {
    // Check if day exists
    let menu = await MessMenu.findOne({ where: { day } });

    if (menu) {
      console.log(`[DEBUG] Found existing entry for ${day}, Updating...`);
      await menu.update({ breakfast, lunch, snacks, dinner });
    } else {
      console.log(`[DEBUG] No entry for ${day}, Creating new record...`);
      await MessMenu.create({ day, breakfast, lunch, snacks, dinner });
    }
    
    console.log(`[DEBUG] Success! Data saved to SQLite.`);
    res.json({ success: true, message: `Menu for ${day} updated` });
  } catch (error) {
    console.error(`[DEBUG] Error saving menu:`, error.message);
    res.status(500).json({ error: error.message });
  }
};