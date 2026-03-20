const Workout = require('../models/Workout');
const { awardXP } = require('../utils/xpUtils');

// Fields allowed in workout create/update requests
const ALLOWED_FIELDS = ['name', 'type', 'duration', 'caloriesBurned', 'sets', 'reps',
                        'weight', 'distance', 'notes', 'date', 'intensity'];

const pickFields = (body, fields) =>
  fields.reduce((acc, k) => { if (body[k] !== undefined) acc[k] = body[k]; return acc; }, {});

// @desc  Get all workouts for user
// @route GET /api/workouts
const getWorkouts = async (req, res) => {
  try {
    const { date, type, limit = 20, page = 1 } = req.query;
    const query = { user: req.user._id };
    if (type) query.type = type;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    const total = await Workout.countDocuments(query);
    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ workouts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create workout
// @route POST /api/workouts
const createWorkout = async (req, res) => {
  try {
    if (!req.body.name || !req.body.duration)
      return res.status(400).json({ message: 'name and duration are required' });

    const data = pickFields(req.body, ALLOWED_FIELDS);
    const workout = await Workout.create({ ...data, user: req.user._id });

    // Award XP and handle level-up
    const xpResult = await awardXP(req.user._id, 25);

    res.status(201).json({ workout, ...xpResult });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update workout
// @route PUT /api/workouts/:id
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    const updates = pickFields(req.body, ALLOWED_FIELDS);
    Object.assign(workout, updates);
    const updated = await workout.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete workout
// @route DELETE /api/workouts/:id
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get workout stats — last 7 days with per-day calorie breakdown for chart
// @route GET /api/workouts/stats
const getWorkoutStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // last 7 days inclusive of today
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const workouts = await Workout.find({ user: req.user._id, date: { $gte: sevenDaysAgo } });

    const totalCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const byType = workouts.reduce((acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {});

    // Build per-day breakdown for the last 7 days
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyCalories = {};
    const dailyDuration = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      dailyCalories[key] = 0;
      dailyDuration[key] = 0;
    }
    workouts.forEach((w) => {
      const key = new Date(w.date).toISOString().slice(0, 10);
      if (dailyCalories[key] !== undefined) {
        dailyCalories[key] += w.caloriesBurned;
        dailyDuration[key] += w.duration;
      }
    });

    const chartLabels = Object.keys(dailyCalories).map((d) => DAY_LABELS[new Date(d).getDay()]);
    const chartCalories = Object.values(dailyCalories);
    const chartDuration = Object.values(dailyDuration);

    res.json({
      totalWorkouts: workouts.length,
      totalCalories,
      totalDuration,
      byType,
      workouts,
      chart: { labels: chartLabels, calories: chartCalories, duration: chartDuration },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWorkouts, createWorkout, updateWorkout, deleteWorkout, getWorkoutStats };
