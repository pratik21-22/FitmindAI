const { awardXP } = require('../utils/xpUtils');
const User = require('../models/User');
const { connect, clearDatabase, close } = require('./helpers/testDb');

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await close(); });

describe('awardXP utility', () => {
  let userId;

  beforeEach(async () => {
    // Use insertMany to bypass the bcrypt pre-save hook — we don't need
    // real password hashing in this unit test suite.
    const result = await User.collection.insertOne({
      name: 'XP Tester',
      email: 'xp@fitmind.test',
      password: '$2a$12$placeholderhashedpassword000000',
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      lastActive: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    userId = result.insertedId;
  });

  it('increments XP by the given amount', async () => {
    await awardXP(userId, 25);
    const user = await User.findById(userId);
    expect(user.xp).toBe(25);
  });

  it('does NOT level up when XP stays below 500', async () => {
    await awardXP(userId, 499);
    const user = await User.findById(userId);
    expect(user.level).toBe(1);
  });

  it('levels up when XP crosses 500', async () => {
    await awardXP(userId, 500);
    const user = await User.findById(userId);
    expect(user.level).toBe(2);
  });

  it('adds a level badge when leveling up', async () => {
    await awardXP(userId, 500);
    const user = await User.findById(userId);
    expect(user.badges).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Level 2 Reached!' })])
    );
  });

  it('levels up multiple times for large XP grants', async () => {
    await awardXP(userId, 1500);
    const user = await User.findById(userId);
    expect(user.level).toBe(4); // 1500/500 = 3 levels above 1 → level 4
  });

  it('returns null for a non-existent userId', async () => {
    const mongoose = require('mongoose');
    const fakeId = new mongoose.Types.ObjectId();
    const result = await awardXP(fakeId, 100);
    expect(result).toBeNull();
  });
});
