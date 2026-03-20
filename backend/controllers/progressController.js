const Progress = require('../models/Progress');

const ALLOWED_FIELDS = ['weight', 'bodyFat', 'muscleMass', 'measurements',
                        'steps', 'waterIntake', 'sleepHours', 'mood', 'notes', 'date'];

const pickFields = (body, fields) =>
  fields.reduce((acc, k) => { if (body[k] !== undefined) acc[k] = body[k]; return acc; }, {});

// @desc  Get progress entries
// @route GET /api/progress
const getProgress = async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const entries = await Progress.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(Number(limit));
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Log progress entry
// @route POST /api/progress
const createProgress = async (req, res) => {
  try {
    if (req.body.weight === undefined)
      return res.status(400).json({ message: 'weight is required' });

    const data = pickFields(req.body, ALLOWED_FIELDS);
    const entry = await Progress.create({ ...data, user: req.user._id });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update progress entry
// @route PUT /api/progress/:id
const updateProgress = async (req, res) => {
  try {
    const entry = await Progress.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Progress entry not found' });
    const updates = pickFields(req.body, ALLOWED_FIELDS);
    Object.assign(entry, updates);
    const updated = await entry.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete progress entry
// @route DELETE /api/progress/:id
const deleteProgress = async (req, res) => {
  try {
    const entry = await Progress.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Progress entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProgress, createProgress, updateProgress, deleteProgress };
