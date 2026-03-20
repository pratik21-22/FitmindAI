const Diet = require('../models/Diet');

const ALLOWED_FIELDS = ['mealName', 'mealType', 'calories', 'protein', 'carbs',
                        'fats', 'fiber', 'servingSize', 'notes', 'date'];

const pickFields = (body, fields) =>
  fields.reduce((acc, k) => { if (body[k] !== undefined) acc[k] = body[k]; return acc; }, {});

// @desc  Get all meals for user
// @route GET /api/diet
const getMeals = async (req, res) => {
  try {
    const { date, mealType } = req.query;
    const query = { user: req.user._id };
    if (mealType) query.mealType = mealType;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    const meals = await Diet.find(query).sort({ date: -1 });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Log a meal
// @route POST /api/diet
const createMeal = async (req, res) => {
  try {
    if (!req.body.mealName || req.body.calories === undefined)
      return res.status(400).json({ message: 'mealName and calories are required' });

    const data = pickFields(req.body, ALLOWED_FIELDS);
    const meal = await Diet.create({ ...data, user: req.user._id });
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update meal
// @route PUT /api/diet/:id
const updateMeal = async (req, res) => {
  try {
    const meal = await Diet.findOne({ _id: req.params.id, user: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    const updates = pickFields(req.body, ALLOWED_FIELDS);
    Object.assign(meal, updates);
    const updated = await meal.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete meal
// @route DELETE /api/diet/:id
const deleteMeal = async (req, res) => {
  try {
    const meal = await Diet.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json({ message: 'Meal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get daily nutrition summary
// @route GET /api/diet/summary
const getDietSummary = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);

    const meals = await Diet.find({ user: req.user._id, date: { $gte: start, $lte: end } });
    const summary = meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fats: acc.fats + m.fats,
        fiber: acc.fiber + m.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );
    res.json({ summary, meals, date: start });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMeals, createMeal, updateMeal, deleteMeal, getDietSummary };
