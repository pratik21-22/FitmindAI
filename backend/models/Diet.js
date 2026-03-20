const mongoose = require('mongoose');

const dietSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mealName: { type: String, required: true, trim: true },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout'],
    default: 'snack'
  },
  calories: { type: Number, required: true, default: 0 },
  protein: { type: Number, default: 0 }, // grams
  carbs: { type: Number, default: 0 },   // grams
  fats: { type: Number, default: 0 },    // grams
  fiber: { type: Number, default: 0 },   // grams
  servingSize: { type: String, default: '1 serving' },
  notes: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Diet', dietSchema);
