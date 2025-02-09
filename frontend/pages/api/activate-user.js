import users from "../../controllers/users";

export default async function handler(
  req,
  res
) {
  return await users.activateAccount(req)
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ message: err.message }));
}