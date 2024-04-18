const axios = require('axios');
const Page = require("../models/page");

const answerQuestion = async (req, res, next) => {
  const embedding = await createEmbedding(req.body.question);

  const pages = await Page.find().limit(3).sort({ $vector: { $meta: embedding } });

  const prompt = `You are a helpful assistant that summarizes relevant notes to help answer a user's questions.
  Given the following notes, answer the user's question.
  
  ${pages.map(page => 'Note: ' + page.textContent).join('\n\n')}
  `.trim();
  const answers = await makeChatGPTRequest(prompt, req.body.question);
  return res.status(200).json({
    sources: pages,
    answer: answers
  })
};

function createEmbedding(input) {
  return axios({
    method: 'POST',
    url: 'https://api.openai.com/v1/embeddings',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    data: {
      model: 'text-embedding-ada-002',
      input
    }
  }).then(res => res.data.data[0].embedding);
}

function makeChatGPTRequest(systemPrompt, question) {
  const options = {
    method: 'POST',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    data: {
      model: 'gpt-3.5-turbo-1106',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ]
    }
  };

  return axios(options).then(res => res.data.choices?.[0]?.message?.content ?? 'No answer received');
}

exports.answerQuestion = answerQuestion;