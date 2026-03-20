const Chat = require('../models/Chat');
const User = require('../models/User');
const OpenAI = require('openai');
const { awardXP } = require('../utils/xpUtils');

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'FitMind AI',
  }
});

const getSystemPrompt = (user) => `You are FitMind AI, an expert personal fitness coach and nutritionist. 
You are helping ${user.name || 'a user'} who:
- Goal: ${user.goal || 'general fitness'}
- Weight: ${user.weight || 'unknown'} kg
- Height: ${user.height || 'unknown'} cm
- Age: ${user.age || 'unknown'} years
- Activity Level: ${user.activityLevel || 'moderate'}
- Gender: ${user.gender || 'not specified'}

Provide personalized, actionable fitness and nutrition advice. Be encouraging, specific, and science-based.
Format responses with clear sections using markdown when helpful. Keep responses concise but comprehensive.`;

// @desc  Chat with AI
// @route POST /api/ai/chat
const chat = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const user = await User.findById(req.user._id);
    let chatSession;

    if (chatId) {
      chatSession = await Chat.findOne({ _id: chatId, user: req.user._id });
    }
    if (!chatSession) {
      chatSession = await Chat.create({
        user: req.user._id,
        title: message.slice(0, 50),
        messages: [],
      });
    }

    // Add user message
    chatSession.messages.push({ role: 'user', content: message });

    // Build messages for OpenAI
    const messages = [
      { role: 'system', content: getSystemPrompt(user) },
      ...chatSession.messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
    ];

    let aiContent = '';

    try {
      const completion = await openai.chat.completions.create({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages,
        max_tokens: 800,
        temperature: 0.7,
      });
      aiContent = completion.choices[0].message.content;
    } catch (aiError) {
      console.error('❌ OpenAI Error:', aiError.message);
      console.error('   Status:', aiError.status || 'N/A');
      console.error('   Code:', aiError.code || 'N/A');
      // Fallback mock response if API fails
      aiContent = generateMockResponse(message);
    }

    chatSession.messages.push({ role: 'assistant', content: aiContent });
    await chatSession.save();

    // Award XP for using AI (with level-up check)
    await awardXP(req.user._id, 5);

    res.json({
      chatId: chatSession._id,
      message: aiContent,
      history: chatSession.messages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Generate personalized fitness + diet plan
// @route POST /api/ai/generate-plan
const generatePlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { planType = 'both' } = req.body;

    const prompt = `Create a detailed ${planType === 'workout' ? 'weekly workout' : planType === 'diet' ? 'weekly diet' : 'complete weekly fitness and diet'} plan for:
- Name: ${user.name}
- Goal: ${user.goal}
- Weight: ${user.weight} kg, Height: ${user.height} cm, Age: ${user.age}
- Gender: ${user.gender}, Activity Level: ${user.activityLevel}

${planType !== 'diet' ? 'Include: Day-by-day workout schedule with exercises, sets, reps, and rest periods.' : ''}
${planType !== 'workout' ? 'Include: Daily meal plan with breakfast, lunch, dinner, and snacks with macros.' : ''}
Format: Use clear markdown with headers for each day. Be specific and practical.`;

    let planContent = '';
    try {
      const completion = await openai.chat.completions.create({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: getSystemPrompt(user) },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.6,
      });
      planContent = completion.choices[0].message.content;
    } catch (aiError) {
      console.error('❌ OpenAI Plan Error:', aiError.message);
      planContent = generateMockPlan(user, planType);
    }

    res.json({ plan: planContent, generatedAt: new Date() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get chat history
// @route GET /api/ai/chats
const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .select('title updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single chat
// @route GET /api/ai/chats/:id
const getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fallback mock responses when no OpenAI key
function generateMockResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes('workout') || lower.includes('exercise')) {
    return `## 💪 Workout Recommendation\n\nGreat question! Here's a solid workout plan for you:\n\n**Upper Body (Mon/Thu):**\n- Bench Press: 3×10\n- Pull-ups: 3×8\n- Shoulder Press: 3×10\n- Bicep Curls: 3×12\n\n**Lower Body (Tue/Fri):**\n- Squats: 4×10\n- Romanian Deadlifts: 3×10\n- Leg Press: 3×12\n- Calf Raises: 4×15\n\n💡 **Tip:** Rest 60–90 seconds between sets and prioritize progressive overload!`;
  }
  if (lower.includes('diet') || lower.includes('nutrition') || lower.includes('food') || lower.includes('eat')) {
    return `## 🥗 Nutrition Guide\n\nHere's a balanced daily nutrition plan:\n\n**Breakfast:** Oats + protein shake + banana (≈500 cal)\n**Lunch:** Chicken breast + brown rice + vegetables (≈600 cal)\n**Snack:** Greek yogurt + almonds (≈250 cal)\n**Dinner:** Salmon + sweet potato + salad (≈550 cal)\n\n**Daily Targets:**\n- 🔥 Calories: ~1,900–2,200\n- 💪 Protein: 150–180g\n- 🌾 Carbs: 200–250g\n- 🥑 Fats: 60–80g\n\n💡 Drink 2–3L of water daily!`;
  }
  if (lower.includes('fat') || lower.includes('lose') || lower.includes('weight loss')) {
    return `## 🔥 Fat Loss Strategy\n\nHere's your evidence-based fat loss plan:\n\n**Key Principles:**\n1. **Caloric Deficit:** Eat 300–500 fewer calories than you burn\n2. **High Protein:** 1.6–2g per kg bodyweight to preserve muscle\n3. **Strength Training:** 3–4x per week to maintain muscle\n4. **Cardio:** 150–200 min/week (mix HIIT + steady-state)\n\n**Quick Tips:**\n- ✅ Track meals with this app\n- ✅ Sleep 7–8 hours nightly\n- ✅ Minimize processed foods\n- ✅ Stay consistent for 8–12 weeks\n\nYou've got this! 💪`;
  }
  return `## 🤖 FitMind AI Response\n\nThanks for your question! I'm your personal AI fitness coach.\n\nTo get the most personalized advice, make sure you've filled in your profile details (weight, height, age, goal).\n\n**I can help you with:**\n- 💪 Custom workout plans\n- 🥗 Personalized nutrition advice\n- 📊 Progress analysis\n- 🔥 Fat loss & muscle building strategies\n- 🧘 Recovery & injury prevention\n\nWhat specific fitness goal would you like help with today?`;
}

function generateMockPlan(user, planType) {
  return `# 🏋️ FitMind AI - Your Personalized Plan\n\n*Generated for ${user.name} | Goal: ${user.goal}*\n\n---\n\n## 📅 Weekly Workout Plan\n\n### Monday – Push Day\n- Bench Press: 4×10\n- Overhead Press: 3×10\n- Tricep Dips: 3×12\n- Lateral Raises: 3×15\n\n### Tuesday – Pull Day\n- Deadlifts: 4×6\n- Pull-ups: 4×8\n- Barbell Rows: 3×10\n- Face Pulls: 3×15\n\n### Wednesday – Active Recovery\n- 30 min walk or yoga\n- Foam rolling\n\n### Thursday – Legs\n- Squats: 4×10\n- Romanian Deadlifts: 3×10\n- Leg Press: 3×12\n- Calf Raises: 4×20\n\n### Friday – Full Body HIIT\n- 20 min HIIT circuit\n- Core workout: planks, crunches, leg raises\n\n### Saturday – Cardio\n- 45 min steady-state cardio\n\n### Sunday – Rest & Meal Prep\n\n---\n\n## 🥗 Daily Meal Plan\n\n**Breakfast (7am):** Oats + 2 eggs + fruit = ~500 cal\n**Lunch (12pm):** Chicken + rice + veggies = ~600 cal\n**Snack (3pm):** Protein shake + banana = ~300 cal\n**Dinner (7pm):** Salmon + sweet potato = ~550 cal\n\n**Daily Totals:** ~1,950 cal | 160g protein | 220g carbs | 65g fats\n\n> 💡 Adjust portions based on your hunger and energy levels. Consistency is key!`;
}

module.exports = { chat, generatePlan, getChatHistory, getChat };
