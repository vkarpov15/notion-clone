import question from "../../controllers/question";

export default async function handler(
  req,
  res
) {
  return await question.answerQuestion(req)
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ message: err.message }));
}