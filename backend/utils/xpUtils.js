const User = require('../models/User');

/**
 * Awards XP to a user and auto-increments their level every 500 XP.
 * Mutates the user document in-place and saves it.
 * @param {string} userId - The user's MongoDB ObjectId
 * @param {number} amount - XP to award
 * @returns {Object} - { xp, level, badges } after update
 */
const awardXP = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) return null;

  user.xp += amount;

  // Level up: 1 level per 500 XP
  const newLevel = Math.floor(user.xp / 500) + 1;
  if (newLevel > user.level) {
    user.level = newLevel;
    user.badges.push({
      name: `Level ${newLevel} Reached!`,
      icon: newLevel >= 10 ? '🏆' : newLevel >= 5 ? '💎' : '⭐',
      earnedAt: new Date(),
    });
  }

  await user.save();
  return { xp: user.xp, level: user.level, badges: user.badges };
};

module.exports = { awardXP };
