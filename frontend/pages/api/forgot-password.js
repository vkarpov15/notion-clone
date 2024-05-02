import users from "../../controllers/users";

export default async function handler(
  req,
  res
) {
  return await users.getResetToken(req).then(data => res.json(data));
}