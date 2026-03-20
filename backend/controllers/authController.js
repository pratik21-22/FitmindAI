const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { awardXP } = require('../utils/xpUtils');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc  Register new user
// @route POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, weight, height, age, gender, goal, activityLevel } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill all required fields' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, weight, height, age, gender, goal, activityLevel });

    // Award first-login badge
    user.badges.push({ name: 'Welcome!', icon: '🎉', earnedAt: new Date() });
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      goal: user.goal,
      streak: user.streak,
      level: user.level,
      xp: user.xp,
      badges: user.badges,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    // Update streak + award XP for consecutive daily logins
    const now = new Date();
    const diffDays = Math.floor((now - new Date(user.lastActive)) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      user.xp += 10; // direct increment before awardXP logic below
      user.streak += 1;
      // Streak milestone badges
      if ([7, 30, 100].includes(user.streak)) {
        user.badges.push({
          name: `${user.streak}-Day Streak!`,
          icon: user.streak >= 100 ? '🏆' : user.streak >= 30 ? '💎' : '🔥',
          earnedAt: new Date(),
        });
      }
    } else if (diffDays > 1) {
      user.streak = 1;
    }

    // Level-up check
    const newLevel = Math.floor(user.xp / 500) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
      user.badges.push({
        name: `Level ${newLevel} Reached!`,
        icon: newLevel >= 10 ? '🏆' : newLevel >= 5 ? '💎' : '⭐',
        earnedAt: new Date(),
      });
    }

    user.lastActive = now;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      goal: user.goal,
      weight: user.weight,
      height: user.height,
      age: user.age,
      gender: user.gender,
      activityLevel: user.activityLevel,
      streak: user.streak,
      level: user.level,
      xp: user.xp,
      badges: user.badges,
      dailyCalorieGoal: user.dailyCalorieGoal,
      dailyStepsGoal: user.dailyStepsGoal,
      notifications: user.notifications,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc  Update user profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Whitelist allowed updatable fields
    const ALLOWED = ['name', 'weight', 'height', 'age', 'gender', 'goal',
                     'activityLevel', 'dailyCalorieGoal', 'dailyStepsGoal', 'notifications', 'avatar'];
    ALLOWED.forEach((key) => {
      if (req.body[key] !== undefined) user[key] = req.body[key];
    });

    // Password change: require current password verification first
    if (req.body.newPassword) {
      if (!req.body.currentPassword)
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch)
        return res.status(401).json({ message: 'Current password is incorrect' });
      if (req.body.newPassword.length < 6)
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      user.password = req.body.newPassword;
    }

    const updatedUser = await user.save();
    res.json({ ...updatedUser.toJSON(), token: generateToken(updatedUser._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, getMe, updateProfile };
