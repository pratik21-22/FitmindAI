const express = require('express');
const router = express.Router();
const { getWorkouts, createWorkout, updateWorkout, deleteWorkout, getWorkoutStats } = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getWorkoutStats);
router.route('/').get(getWorkouts).post(createWorkout);
router.route('/:id').put(updateWorkout).delete(deleteWorkout);

module.exports = router;
