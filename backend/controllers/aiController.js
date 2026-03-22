const Chat = require('../models/Chat');
const User = require('../models/User');
const OpenAI = require('openai');
const { awardXP } = require('../utils/xpUtils');

const normalize = (value) => String(value || '').trim();
const AI_PROVIDER = normalize(process.env.AI_PROVIDER || 'auto').toLowerCase();
const OPENROUTER_API_KEY = normalize(process.env.OPENROUTER_API_KEY);
const HUGGINGFACE_API_KEY = normalize(process.env.HUGGINGFACE_API_KEY);
const OPENROUTER_MODEL = normalize(process.env.AI_MODEL_OPENROUTER || 'meta-llama/llama-3.1-8b-instruct:free');
const HUGGINGFACE_MODEL = normalize(process.env.AI_MODEL_HUGGINGFACE || 'Qwen/Qwen2.5-7B-Instruct');

const createOpenRouterClient = () => {
  if (!OPENROUTER_API_KEY) return null;
  return new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
      'X-Title': 'FitMind AI',
    },
  });
};

const createHuggingFaceClient = () => {
  if (!HUGGINGFACE_API_KEY) return null;
  return new OpenAI({
    apiKey: HUGGINGFACE_API_KEY,
    baseURL: 'https://router.huggingface.co/v1',
  });
};

const openRouterClient = createOpenRouterClient();
const huggingFaceClient = createHuggingFaceClient();

const getSystemPrompt = (user) => `You are FitMind AI, an expert personal fitness coach and nutritionist. 
You are helping ${user.name || 'a user'} who:
- Goal: ${user.goal || 'general fitness'}
- Weight: ${user.weight || 'unknown'} kg
- Height: ${user.height || 'unknown'} cm
- Age: ${user.age || 'unknown'} years
- Activity Level: ${user.activityLevel || 'moderate'}
- Gender: ${user.gender || 'not specified'}

Provide personalized, actionable fitness and nutrition advice. Be encouraging, specific, and science-based.
Format responses with clear sections using markdown when helpful. Keep responses concise but comprehensive.
Do not repeat the same opening line each answer. Vary phrasing and examples naturally.`;

const generateVariationHint = () => {
  const choices = [
    'Use a practical and direct tone.',
    'Keep this answer short and action-focused.',
    'Use one motivating line and then concrete steps.',
    'Use bullet points and specific numbers when possible.',
  ];
  return choices[Math.floor(Math.random() * choices.length)];
};

const buildConversationMessages = (user, chatSession) => {
  const variationHint = generateVariationHint();
  return [
    { role: 'system', content: getSystemPrompt(user) },
    { role: 'system', content: `Style hint: ${variationHint}` },
    ...chatSession.messages.slice(-14).map((m) => ({ role: m.role, content: m.content })),
  ];
};

const extractContent = (completion) => completion?.choices?.[0]?.message?.content || '';

const requestChatCompletion = async ({ messages, maxTokens }) => {
  const providers = [];

  if (AI_PROVIDER === 'openrouter' || AI_PROVIDER === 'auto') {
    if (openRouterClient) {
      providers.push({
        name: 'openrouter',
        model: OPENROUTER_MODEL,
        client: openRouterClient,
      });
    }
  }

  if (AI_PROVIDER === 'huggingface' || AI_PROVIDER === 'auto') {
    if (huggingFaceClient) {
      providers.push({
        name: 'huggingface',
        model: HUGGINGFACE_MODEL,
        client: huggingFaceClient,
      });
    }
  }

  const errors = [];

  for (const provider of providers) {
    try {
      const completion = await provider.client.chat.completions.create({
        model: provider.model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.95,
        top_p: 0.95,
        presence_penalty: 0.35,
        frequency_penalty: 0.25,
      });

      const content = extractContent(completion);
      if (content) {
        return { content, provider: provider.name, model: provider.model };
      }

      errors.push(`${provider.name}: empty content`);
    } catch (error) {
      errors.push(`${provider.name}: ${error.message}`);
    }
  }

  throw new Error(errors.length ? errors.join(' | ') : 'No AI provider configured');
};

const buildFallbackReply = (user, message, reason) => {
  const goal = user?.goal || 'general fitness';
  const headline = [
    '## Coaching Backup Response',
    '## Practical Fitness Guidance',
    '## Personalized Quick Plan',
  ][Math.floor(Math.random() * 3)];

  return `${headline}\n\nI could not reach the live AI provider right now, so here is a tailored response for your request:\n\n> Your message: "${message}"\n\n### Your context\n- Goal: ${goal}\n- Activity level: ${user?.activityLevel || 'moderate'}\n- Focus for today: Consistency + progressive overload\n\n### Actionable next step\n1. Do one 30-45 min session aligned to your goal\n2. Hit protein target (roughly 1.6-2.0 g per kg bodyweight)\n3. Sleep 7-8 hours and hydrate well\n\n### Why this helps\nShort, repeatable habits improve adherence and results over time.\n\nProvider status: ${reason || 'fallback mode'}`;
};

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

    const messages = buildConversationMessages(user, chatSession);

    let aiContent = '';
    let aiMeta = { provider: 'fallback', model: 'internal-fallback', fallback: true, reason: 'unknown' };

    try {
      const result = await requestChatCompletion({ messages, maxTokens: 800 });
      aiContent = result.content;
      aiMeta = { provider: result.provider, model: result.model, fallback: false, reason: null };
    } catch (aiError) {
      console.error('❌ AI Error:', aiError.message);
      aiContent = buildFallbackReply(user, message, aiError.message);
      aiMeta = { provider: 'fallback', model: 'internal-fallback', fallback: true, reason: aiError.message };
    }

    chatSession.messages.push({ role: 'assistant', content: aiContent });
    await chatSession.save();

    // Award XP for using AI (with level-up check)
    await awardXP(req.user._id, 5);

    res.json({
      chatId: chatSession._id,
      message: aiContent,
      history: chatSession.messages,
      meta: aiMeta,
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
    let planMeta = { provider: 'fallback', model: 'internal-fallback', fallback: true, reason: 'unknown' };
    try {
      const result = await requestChatCompletion({
        messages: [
          { role: 'system', content: getSystemPrompt(user) },
          { role: 'user', content: prompt },
        ],
        maxTokens: 1500,
      });
      planContent = result.content;
      planMeta = { provider: result.provider, model: result.model, fallback: false, reason: null };
    } catch (aiError) {
      console.error('❌ AI Plan Error:', aiError.message);
      planContent = generateMockPlan(user, planType);
      planMeta = { provider: 'fallback', model: 'internal-fallback', fallback: true, reason: aiError.message };
    }

    res.json({ plan: planContent, generatedAt: new Date(), meta: planMeta });
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
  const motivators = ['You got this! 💪', 'Keep going, your consistency will pay off. 🔥', 'Small daily wins create big results. 🚀'];
  const ending = motivators[Math.floor(Math.random() * motivators.length)];
  if (lower.includes('workout') || lower.includes('exercise')) {
    return `## 💪 Workout Recommendation\n\nHere is a simple structure you can start this week:\n\n**Upper Body (Mon/Thu):**\n- Bench Press: 3×10\n- Pull-ups: 3×8\n- Shoulder Press: 3×10\n- Bicep Curls: 3×12\n\n**Lower Body (Tue/Fri):**\n- Squats: 4×10\n- Romanian Deadlifts: 3×10\n- Leg Press: 3×12\n- Calf Raises: 4×15\n\n💡 **Tip:** Rest 60-90 seconds between sets and increase weight gradually.\n\n${ending}`;
  }
  if (lower.includes('diet') || lower.includes('nutrition') || lower.includes('food') || lower.includes('eat')) {
    return `## 🥗 Nutrition Guide\n\nTry this balanced day template:\n\n**Breakfast:** Oats + protein shake + banana (~500 cal)\n**Lunch:** Chicken breast + brown rice + vegetables (~600 cal)\n**Snack:** Greek yogurt + almonds (~250 cal)\n**Dinner:** Salmon + sweet potato + salad (~550 cal)\n\n**Daily Targets:**\n- Calories: ~1,900-2,200\n- Protein: 150-180g\n- Carbs: 200-250g\n- Fats: 60-80g\n\n${ending}`;
  }
  if (lower.includes('fat') || lower.includes('lose') || lower.includes('weight loss')) {
    return `## 🔥 Fat Loss Strategy\n\nA strong fat-loss framework:\n\n**Key Principles:**\n1. Caloric deficit: 300-500 calories below maintenance\n2. High protein: 1.6-2g per kg bodyweight\n3. Strength training: 3-4 sessions per week\n4. Cardio: 150-200 minutes weekly\n\n**Quick Tips:**\n- Track meals daily\n- Sleep 7-8 hours\n- Keep processed food low\n- Review progress every 2 weeks\n\n${ending}`;
  }
  return `## 🤖 FitMind AI Response\n\nThanks for your question. I can give tailored coaching if you share your exact goal and constraints (time, gym/home, equipment, diet preference).\n\n**I can help with:**\n- Custom workout plans\n- Nutrition strategy\n- Progress plateaus\n- Recovery and injury-safe training\n\n${ending}`;
}

function generateMockPlan(user, planType) {
  return `# 🏋️ FitMind AI - Your Personalized Plan\n\n*Generated for ${user.name} | Goal: ${user.goal}*\n\n---\n\n## 📅 Weekly Workout Plan\n\n### Monday – Push Day\n- Bench Press: 4×10\n- Overhead Press: 3×10\n- Tricep Dips: 3×12\n- Lateral Raises: 3×15\n\n### Tuesday – Pull Day\n- Deadlifts: 4×6\n- Pull-ups: 4×8\n- Barbell Rows: 3×10\n- Face Pulls: 3×15\n\n### Wednesday – Active Recovery\n- 30 min walk or yoga\n- Foam rolling\n\n### Thursday – Legs\n- Squats: 4×10\n- Romanian Deadlifts: 3×10\n- Leg Press: 3×12\n- Calf Raises: 4×20\n\n### Friday – Full Body HIIT\n- 20 min HIIT circuit\n- Core workout: planks, crunches, leg raises\n\n### Saturday – Cardio\n- 45 min steady-state cardio\n\n### Sunday – Rest & Meal Prep\n\n---\n\n## 🥗 Daily Meal Plan\n\n**Breakfast (7am):** Oats + 2 eggs + fruit = ~500 cal\n**Lunch (12pm):** Chicken + rice + veggies = ~600 cal\n**Snack (3pm):** Protein shake + banana = ~300 cal\n**Dinner (7pm):** Salmon + sweet potato = ~550 cal\n\n**Daily Totals:** ~1,950 cal | 160g protein | 220g carbs | 65g fats\n\n> 💡 Adjust portions based on your hunger and energy levels. Consistency is key!`;
}

module.exports = { chat, generatePlan, getChatHistory, getChat };
