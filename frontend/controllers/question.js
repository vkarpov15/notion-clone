const axios = require("axios");
const { isAuth } = require("./auth");
const Page = require("../models/page");
const RateLimit = require("../models/rateLimit");

const maxOpenAIRequestsPerHour = 250;

const answerQuestion = async (req) => {
  isAuth(req);
  const userId = req.userId;
  const embedding = await createEmbedding(req.body.question);

  const pages = await Page
    .find({ creator: userId })
    .limit(3)
    .sort({ vector: { $meta: embedding } });

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
  const date = new Date();
  await RateLimit.insertOne({ functionName, date });
  const rateLimits = await RateLimit.find({ functionName }).sort({ date: 1 });

  if (rateLimits.length >= maxOpenAIRequestsPerHour) {
    await RateLimit.deleteOne({ _id: rateLimits[0]._id });

    if (rateLimits[0].date > date.valueOf() - 1000 * 60 * 60) {
      throw new Error(`Maximum ${maxOpenAIRequestsPerHour} requests per hour`);
    }
    for (const rateLimit of rateLimits.slice(1)) {
      if (rateLimit.date < date.valueOf() - 1000 * 60 * 60) {
        await RateLimit.deleteOne({ _id: rateLimit._id });
      } else {
        break;
      }
    }
  }
}

async function createEmbedding(input) {
  await checkRateLimit('createEmbedding');
  return axios({
    method: "POST",
    url: "https://api.openai.com/v1/embeddings",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    data: {
      model: "text-embedding-ada-002",
      input
    }
  }).then(res => res.data.data[0].embedding);
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
