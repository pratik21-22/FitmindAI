const express = require('express');
const router = express.Router();
const { getMeals, createMeal, updateMeal, deleteMeal, getDietSummary } = require('../controllers/dietController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/summary', getDietSummary);
router.route('/').get(getMeals).post(createMeal);
router.route('/:id').put(updateMeal).delete(deleteMeal);

module.exports = router;
