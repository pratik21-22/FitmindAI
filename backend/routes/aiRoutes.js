const express = require('express');
const router = express.Router();
const { chat, generatePlan, getChatHistory, getChat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/chat', chat);
router.post('/generate-plan', generatePlan);
router.get('/chats', getChatHistory);
router.get('/chats/:id', getChat);

module.exports = router;
