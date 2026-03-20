const express = require('express');
const router = express.Router();
const { getProgress, createProgress, updateProgress, deleteProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getProgress).post(createProgress);
router.route('/:id').put(updateProgress).delete(deleteProgress);

module.exports = router;
