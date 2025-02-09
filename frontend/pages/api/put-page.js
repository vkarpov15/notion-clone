import pages from "../../controllers/pages";

export default async function handler(
  req,
  res
) {
  return await pages.putPage(req)
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ message: err.message }));
}