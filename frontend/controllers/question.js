const axios = require("axios");
const { isAuth } = require("./auth");
const Page = require("../models/page");
const RateLimit = require("../models/rateLimit");

const maxOpenAIRequestsPerHour = 250;

const answerQuestion = async (req) => {
  isAuth(req);
  const userId = req.userId;

  const pages = await Page
    .find({ creator: userId })
    .limit(3)
    .sort({ $vectorize: { $meta: req.body.question } });

  const prompt = `You are a helpful assistant that summarizes relevant notes to help answer a user's questions.
  Given the following notes, answer the user's question.
  
  ${pages.map(page => 'Note: ' + page.textContent).join('\n\n')}
  `.trim();
  const answers = await makeChatGPTRequest(prompt, req.body.question);

  return {
    sources: pages,
    answer: answers
  };
};

async function checkRateLimit(functionName) {
  const rateLimit = await RateLimit.collection.findOneAndUpdate(
    {},
    { $push: { recentRequests: { date: new Date(), url: functionName } } },
    { returnDocument: 'before', upsert: true }
  );
  const recentRequests = rateLimit?.recentRequests ?? [];

  if (recentRequests.length >= maxOpenAIRequestsPerHour) {
    await RateLimit.collection.updateOne({ _id: rateLimit._id }, { $pop: { recentRequests: -1 } });
    
    if (recentRequests[0].date > Date.now() - 1000 * 60 * 60) {
      throw new Error(`Maximum ${maxOpenAIRequestsPerHour} requests per hour`);
    }
  }
}

async function makeChatGPTRequest(systemPrompt, question) {
  await checkRateLimit('makeChatGPTRequest');
  const options = {
    method: "POST",
    url: "https://api.openai.com/v1/chat/completions",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    data: {
      model: "gpt-3.5-turbo-1106",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ]
    }
  };

  return axios(options).then(res => res.data.choices?.[0]?.message?.content ?? 'No answer received');
}

exports.answerQuestion = answerQuestion;