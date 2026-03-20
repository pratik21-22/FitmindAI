const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weight: { type: Number, required: true },
  bodyFat: { type: Number, default: 0 },
  muscleMass: { type: Number, default: 0 },
  measurements: {
    chest: { type: Number, default: 0 },
    waist: { type: Number, default: 0 },
    hips: { type: Number, default: 0 },
    arms: { type: Number, default: 0 },
    thighs: { type: Number, default: 0 },
  },
  steps: { type: Number, default: 0 },
  waterIntake: { type: Number, default: 0 }, // liters
  sleepHours: { type: Number, default: 0 },
  mood: { type: String, enum: ['great', 'good', 'okay', 'bad', 'terrible'], default: 'good' },
  notes: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
