const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  weight: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  age: { type: Number, default: 0 },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  goal: { type: String, enum: ['lose_fat', 'build_muscle', 'maintain', 'improve_endurance'], default: 'maintain' },
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], default: 'moderate' },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  badges: [{ name: String, icon: String, earnedAt: Date }],
  dailyCalorieGoal: { type: Number, default: 2000 },
  dailyStepsGoal: { type: Number, default: 10000 },
  notifications: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
