const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'sports', 'hiit', 'yoga', 'other'],
    default: 'other'
  },
  duration: { type: Number, required: true }, // minutes
  caloriesBurned: { type: Number, default: 0 },
  sets: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  weight: { type: Number, default: 0 }, // kg
  distance: { type: Number, default: 0 }, // km
  notes: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
